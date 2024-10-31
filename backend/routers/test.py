from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
import os
from typing import Optional
import tempfile
from pydantic import BaseModel
import base64
from io import BytesIO
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto import Random
from fastapi import APIRouter

#app = FastAPI(title="Steganography API")
router = APIRouter()

# Configure constants
HEADER_TEXT = "M6nMjy5THr2J"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class EncodeRequest(BaseModel):
    message: str
    password: Optional[str] = None

class DecodeRequest(BaseModel):
    password: Optional[str] = None

def encrypt(key, source, encode=True):
    key = SHA256.new(key).digest()
    IV = Random.new().read(AES.block_size)
    encryptor = AES.new(key, AES.MODE_CBC, IV)
    padding = AES.block_size - len(source) % AES.block_size
    source += bytes([padding]) * padding
    data = IV + encryptor.encrypt(source)
    return base64.b64encode(data).decode() if encode else data

def decrypt(key, source, decode=True):
    if decode:
        source = base64.b64decode(source.encode())
    key = SHA256.new(key).digest()
    IV = source[:AES.block_size]
    decryptor = AES.new(key, AES.MODE_CBC, IV)
    data = decryptor.decrypt(source[AES.block_size:])
    padding = data[-1]
    if data[-padding:] != bytes([padding]) * padding:
        raise ValueError("Invalid padding...")
    return data[:-padding]

def convert_to_rgb(img):
    try:
        rgba_image = img
        rgba_image.load()
        background = Image.new("RGB", rgba_image.size, (255, 255, 255))
        background.paste(rgba_image, mask=rgba_image.split()[3])
        return background
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Couldn't convert image to RGB: {str(e)}")

def get_pixel_count(img):
    width, height = img.size
    return width * height

def encode_image(image: Image.Image, message: str) -> Image.Image:
    try:
        width, height = image.size
        pix = image.getdata()
        current_pixel = 0
        tmp = 0
        x = 0
        y = 0
        
        for ch in message:
            binary_value = format(ord(ch), '08b')
            p1 = pix[current_pixel]
            p2 = pix[current_pixel + 1]
            p3 = pix[current_pixel + 2]
            
            three_pixels = [val for val in p1 + p2 + p3]

            for i in range(0, 8):
                current_bit = binary_value[i]
                if current_bit == '0' and three_pixels[i] % 2 != 0:
                    three_pixels[i] = three_pixels[i] - 1 if three_pixels[i] == 255 else three_pixels[i] + 1
                elif current_bit == '1' and three_pixels[i] % 2 == 0:
                    three_pixels[i] = three_pixels[i] - 1 if three_pixels[i] == 255 else three_pixels[i] + 1

            current_pixel += 3
            tmp += 1

            if tmp == len(message):
                if three_pixels[-1] % 2 == 0:
                    three_pixels[-1] = three_pixels[-1] - 1 if three_pixels[-1] == 255 else three_pixels[-1] + 1
            else:
                if three_pixels[-1] % 2 != 0:
                    three_pixels[-1] = three_pixels[-1] - 1 if three_pixels[-1] == 255 else three_pixels[-1] + 1

            three_pixels = tuple(three_pixels)
            st = 0
            end = 3

            for i in range(0, 3):
                image.putpixel((x, y), three_pixels[st:end])
                st += 3
                end += 3

                if x == width - 1:
                    x = 0
                    y += 1
                else:
                    x += 1

        return image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error encoding image: {str(e)}")

def decode_image(image: Image.Image) -> str:
    try:
        pix = image.getdata()
        current_pixel = 0
        decoded = ""
        
        while True:
            binary_value = ""
            p1 = pix[current_pixel]
            p2 = pix[current_pixel + 1]
            p3 = pix[current_pixel + 2]
            three_pixels = [val for val in p1 + p2 + p3]

            for i in range(0, 8):
                binary_value += "0" if three_pixels[i] % 2 == 0 else "1"

            binary_value = binary_value.strip()
            ascii_value = int(binary_value, 2)
            decoded += chr(ascii_value)
            current_pixel += 3

            if three_pixels[-1] % 2 != 0:
                break

        return decoded
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error decoding image: {str(e)}")

@router.post("/encode")
async def encode(
    image: UploadFile = File(...),
    message: str = Form(...),
    password: Optional[str] = Form(None)
):
    try:
        # Validate file extension
        file_ext = image.filename.split('.')[-1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file format. Only PNG, JPG, and JPEG are allowed.")

        # Read and validate image
        img = Image.open(BytesIO(await image.read()))
        if img.mode != 'RGB':
            img = convert_to_rgb(img)

        # Validate message length
        if (len(message) + len(HEADER_TEXT)) * 3 > get_pixel_count(img):
            raise HTTPException(status_code=400, detail="Message is too long for this image")

        # Prepare message with header
        full_message = HEADER_TEXT + message
        
        # Encrypt message if password provided
        if password:
            full_message = HEADER_TEXT + encrypt(password.encode(), message.encode())

        # Create copy of image and encode message
        new_img = img.copy()
        encoded_img = encode_image(new_img, full_message)

        # Save encoded image to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
            encoded_img.save(tmp_file.name, format='PNG')
            return FileResponse(
                tmp_file.name,
                media_type='image/png',
                filename=f"encoded_{image.filename.split('.')[0]}.png"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if 'tmp_file' in locals():
            os.unlink(tmp_file.name)

@router.post("/decode")
async def decode(
    image: UploadFile = File(...),
    password: Optional[str] = Form(None)
):
    try:
        # Read and validate image
        img = Image.open(BytesIO(await image.read()))
        if img.mode != 'RGB':
            img = convert_to_rgb(img)

        # Decode the message
        cipher = decode_image(img)
        
        # Verify header
        header = cipher[:len(HEADER_TEXT)]
        if header != HEADER_TEXT:
            raise HTTPException(status_code=400, detail="Invalid data in image")

        # Handle decryption if password provided
        if password:
            try:
                encrypted_text = cipher[len(HEADER_TEXT):]
                decrypted = decrypt(password.encode(), encrypted_text)
                header = decrypted[:len(HEADER_TEXT)].decode()
                
                if header != HEADER_TEXT:
                    raise HTTPException(status_code=400, detail="Invalid password")
                
                message = decrypted[len(HEADER_TEXT):].decode()
            except Exception:
                raise HTTPException(status_code=400, detail="Decryption failed - wrong password")
        else:
            message = cipher[len(HEADER_TEXT):]

        return JSONResponse(content={"message": message})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def root():
    return {"message": "Steganography API is running"}



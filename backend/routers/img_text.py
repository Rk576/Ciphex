from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto import Random
from PIL import Image
import base64
import os
from io import BytesIO
from starlette.responses import StreamingResponse
from fastapi import APIRouter
import sys
# app = FastAPI()
router=APIRouter()
headerText = "M6nMjy5THr2J"

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

def encode_image(image, message):
    width, height = image.size
    pix = image.getdata()
    new_image = image.copy()
    x = y = current_pixel = tmp = 0
    for ch in message:
        binary_value = format(ord(ch), '08b')
        p1 = pix[current_pixel]
        p2 = pix[current_pixel + 1]
        p3 = pix[current_pixel + 2]
        three_pixels = [val for val in p1 + p2 + p3]
        for i in range(0, 8):
            current_bit = binary_value[i]
            if current_bit == '0' and three_pixels[i] % 2 != 0:
                three_pixels[i] -= 1 if three_pixels[i] == 255 else -1
            elif current_bit == '1' and three_pixels[i] % 2 == 0:
                three_pixels[i] -= 1 if three_pixels[i] == 255 else -1
        current_pixel += 3
        tmp += 1
        if tmp == len(message):
            if three_pixels[-1] % 2 == 0:
                three_pixels[-1] -= 1 if three_pixels[-1] == 255 else -1
        else:
            if three_pixels[-1] % 2 != 0:
                three_pixels[-1] -= 1 if three_pixels[-1] == 255 else -1
        three_pixels = tuple(three_pixels)
        for i in range(0, 3):
            new_image.putpixel((x, y), three_pixels[i*3:(i+1)*3])
            x = 0 if x == width - 1 else x + 1
            y += 1 if x == 0 else 0
    return new_image

def decode_image(image):
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
        decoded += chr(int(binary_value, 2))
        current_pixel += 3
        if three_pixels[-1] % 2 != 0:
            break
    return decoded

@router.post("/encode/")
async def encrypt_image(file: UploadFile = File(...), message: str = Form(...), password: str = Form("")):
    try:
        image = Image.open(file.file)
        if image.mode != 'RGB':
            image = image.convert("RGB")
        
        message = headerText + message
        if (len(message) + len(headerText)) * 3 > image.width * image.height:
            raise HTTPException(status_code=400, detail="Message too long to encode in the image.")
        
        cipher = encrypt(key=password.encode(), source=message.encode()) if password else message
        cipher = headerText + cipher if password else message
        
        encoded_image = encode_image(image, cipher)
        
        buffer = BytesIO()
        encoded_image.save(buffer, format="PNG")
        buffer.seek(0)
        
        return StreamingResponse(buffer, media_type="image/png", headers={"Content-Disposition": "attachment; filename=encrypted_image.png"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decode/")
async def decrypt_image(file: UploadFile = File(...), password: str = Form("")):
    try:
        image = Image.open(file.file)
        cipher_text = decode_image(image)
        
        if cipher_text[:len(headerText)] != headerText:
            raise HTTPException(status_code=400, detail="Invalid data or header.")
        
        #decrypted = cipher_text[len(headerText):]
        header=cipher_text[:len(headerText)]

        decrypted=""            
        if password != "":
            cipher_text=cipher_text[len(headerText):]
            try:
                 decrypted=decrypt(key=password.encode(),source=cipher_text)
            except Exception as e:
                 raise HTTPException(status_code=400, detail="Incorrect password.")
        else:
            decrypted=cipher_text
        header = decrypted.decode()[:len(headerText)]
        if header!=headerText:
            print("[red]Wrong password![/red]")
            sys.exit(0)
        decrypted = decrypted[len(headerText):]

		
			
        # if password:
        #     try:
        #         decrypted = decrypt(key=password.encode(), source=decrypted)
        #         decrypted = decrypted.decode()
        #     except ValueError:
        #         raise HTTPException(status_code=400, detail="Incorrect password.")
        
        return {"decoded_text": decrypted}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

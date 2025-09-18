import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import HTTPException
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Cloudinary configuration
# You'll need to set these environment variables or replace with your actual credentials
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "your_cloud_name")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "your_api_key") 
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "your_api_secret")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

async def upload_image(file_data: bytes, filename: str) -> str:
    """
    Upload image to Cloudinary and return the secure URL
    """
    try:
        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(
            file_data,
            folder="family_journal",  # Organize uploads in a folder
            public_id=filename,       # Use original filename as public_id
            overwrite=True,           # Allow overwriting if same filename
            resource_type="image"     # Specify that this is an image
        )
        
        # Return the secure URL
        return result["secure_url"]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

async def delete_image(public_id: str) -> bool:
    """
    Delete image from Cloudinary
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Failed to delete image: {str(e)}")
        return False
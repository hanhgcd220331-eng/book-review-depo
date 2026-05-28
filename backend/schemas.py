from pydantic import BaseModel
from typing import List, Optional

class ReviewCreate(BaseModel):
    reviewer_name: str # Phải có cái này
    rating: int
    comment: str       # Thay 'content' thành 'comment'

class ReviewResponse(ReviewCreate):
    id: int
    book_id: int
    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    title: str
    author: str

class BookResponse(BookCreate):
    id: int
    reviews: List[ReviewResponse] = []
    class Config:
        from_attributes = True
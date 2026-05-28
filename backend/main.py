from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database

# Khởi tạo bảng dữ liệu
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="DEPO Book Review API")

# CẤU HÌNH CORS CHUẨN - Phải để allow_origins=["*"] hoặc liệt kê chính xác origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/books", response_model=List[schemas.BookResponse])
def get_books(db: Session = Depends(database.get_db)):
    # .all() này sẽ tự động lấy kèm reviews nếu bạn đã định nghĩa relationship
    return db.query(models.Book).all()

@app.post("/books", response_model=schemas.BookResponse)
def create_book(book: schemas.BookCreate, db: Session = Depends(database.get_db)):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.post("/books/{book_id}/reviews", response_model=schemas.ReviewResponse)
def add_review(book_id: int, review: schemas.ReviewCreate, db: Session = Depends(database.get_db)):
    # Kiểm tra xem sách có tồn tại không
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Sách không tồn tại")
    
    # Tạo review mới
    db_review = models.Review(**review.model_dump(), book_id=book_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
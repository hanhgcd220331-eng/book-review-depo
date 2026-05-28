import React, { useState, useEffect } from 'react';
import axios from 'axios';


const API_URL = 'https://book-review-depo-production.up.railway.app';

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [reviewContent, setReviewContent] = useState('');

  // 1. Lấy danh sách sách kèm review từ Backend
  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Lỗi kết nối Backend:", err.message);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  // 2. Thêm sách mới
  const addBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/books`, { 
        title: title, 
        author: author 
      });
      setTitle(''); 
      setAuthor('');
      fetchBooks(); // Refresh danh sách
    } catch (err) {
      alert("Lỗi khi thêm sách! Kiểm tra Console.");
    }
  };

  // 3. Gửi Review (Đã khớp hoàn toàn với Models: reviewer_name, rating, comment)
  const addReview = async (bookId) => {
    if (!reviewContent) return;
    try {
      await axios.post(`${API_URL}/books/${bookId}/reviews`, { 
        reviewer_name: "DEPO Member", // Trường bắt buộc trong model
        rating: 5,                   // Trường bắt buộc trong model
        comment: String(reviewContent) // Đổi từ content -> comment để khớp model
      });
      setReviewContent('');
      setSelectedBookId(null);
      alert("Đã gửi review thành công cho DEPO!");
      fetchBooks(); // Refresh để hiện review mới lên màn hình
    } catch (e) {
      console.error("Lỗi 422/500:", e.response?.data);
      alert("Gửi thất bại! Hãy kiểm tra Console F12 để xem lỗi Schema.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-indigo-600 tracking-tighter">DEPO</h1>
          <p className="text-slate-400 font-medium ml-1">Professional Book Review System</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* CỘT TRÁI: FORM NHẬP SÁCH */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 sticky top-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Entry</h2>
            <form onSubmit={addBook} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Book Title</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all" 
                  placeholder="e.g. Clean Code" 
                  value={title} onChange={e => setTitle(e.target.value)} required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Author Name</label>
                <input 
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all" 
                  placeholder="e.g. Robert C. Martin" 
                  value={author} onChange={e => setAuthor(e.target.value)} required 
                />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-transform active:scale-95">
                Save to Neon Database
              </button>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH SÁCH */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Library Collection</h2>
          
          {books.length === 0 && <p className="text-slate-400 italic">No books found in your database.</p>}
          
          {books.map(book => (
            <div key={book.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black mb-2 inline-block uppercase tracking-wider">Book ID: #{book.id}</span>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">{book.title}</h3>
                  <p className="text-indigo-500 font-semibold mt-1">by {book.author}</p>
                </div>
                <button 
                  onClick={() => setSelectedBookId(selectedBookId === book.id ? null : book.id)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedBookId === book.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}
                >
                  {selectedBookId === book.id ? 'Cancel' : 'Add Review'}
                </button>
              </div>

              {/* PHẦN HIỂN THỊ CÁC REVIEWS CỦA CUỐN SÁCH NÀY */}
              <div className="mt-6 space-y-3">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map(rev => (
                    <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {rev.reviewer_name[0]}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{rev.reviewer_name}</span>
                        <span className="text-xs text-amber-500 ml-auto">★ {rev.rating}/5</span>
                      </div>
                      <p className="text-sm text-slate-600 ml-8">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-300 italic ml-2">No reviews yet for this book.</p>
                )}
              </div>

              {/* Ô NHẬP REVIEW (HIỆN KHI BẤM NÚT) */}
              {selectedBookId === book.id && (
                <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <textarea 
                    className="w-full p-5 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-400 focus:bg-white text-sm"
                    placeholder="What are your thoughts on this book?"
                    rows="3"
                    value={reviewContent}
                    onChange={e => setReviewContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-3">
                    <button 
                      onClick={() => addReview(book.id)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
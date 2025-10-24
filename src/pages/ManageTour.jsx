// --- Hook Debounce ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  if (totalPages <= 5 + width * 2) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
  const pages = new Set([1]);
  for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) { pages.add(i); }
  pages.add(totalPages);
  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = []; let lastPage = 0;
  for (const page of sortedPages) { if (lastPage !== 0 && page - lastPage > 1) { finalPages.push("..."); } finalPages.push(page); lastPage = page; }
  return finalPages;
};

// --- Các hàm helpers ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(number);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Hiển thị đầy đủ Ngày/Tháng/Năm Giờ:Phút
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    try {
        return new Date(dateString).toLocaleString("vi-VN", options);
    } catch (e) {
        console.error("Invalid date string:", dateString, e);
        return 'Invalid Date';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'pending': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
};

// --- Hàm lấy products từ booking (Chỉ tour) ---
const getProductsFromBooking = (booking) => {
    const prods = [];
    // Kiểm tra booking và main_tour tồn tại
    if (booking && booking.main_tour) {
        prods.push(booking.main_tour);
    }
    return prods;
};

// --- Hàm Gửi Email (Sử dụng Resend) ---
const sendBookingEmail = async (booking, newStatus) => {
    // Kiểm tra kỹ hơn các thuộc tính cần thiết
    if (!booking || !booking.user || !booking.user.email || !booking.main_tour || !booking.main_tour.name) {
        console.error("Thiếu thông tin booking để gửi email:", booking);
        toast.error("Thiếu thông tin booking để gửi email.");
        return;
    }
    if (newStatus !== 'confirmed' && newStatus !== 'cancelled') { return; }

    const customerEmail = booking.user.email;
    const customerName = booking.user.full_name || 'Quý khách';
    const tourName = booking.main_tour.name;
    const bookingId = booking.id;

    let subject = '';
    let emailBody = '';

    if (newStatus === 'confirmed') {
        subject = `TourZen: Đơn hàng #${bookingId.slice(-6).toUpperCase()} của bạn đã được xác nhận!`; // Mã đơn ngắn gọn hơn
        emailBody = `
            <h2>Chào ${customerName},</h2>
            <p>Chúng tôi vui mừng thông báo đơn đặt tour <strong>${tourName}</strong> (Mã đơn: #${bookingId.slice(-6).toUpperCase()}) của bạn đã được xác nhận thành công.</p>
            <p>Chi tiết tour và các thông tin cần thiết sẽ được gửi trong email tiếp theo hoặc bạn có thể xem lại trong mục "Đơn hàng của tôi" trên website.</p>
            <p>Cảm ơn bạn đã tin tưởng TourZen!</p>
            <hr>
            <p style="font-size: 0.8em; color: #666;">Đây là email tự động, vui lòng không trả lời.</p>
        `;
    } else if (newStatus === 'cancelled') {
        subject = `TourZen: Đơn hàng #${bookingId.slice(-6).toUpperCase()} của bạn đã bị hủy.`;
        emailBody = `
            <h2>Chào ${customerName},</h2>
            <p>Chúng tôi rất tiếc phải thông báo đơn đặt tour <strong>${tourName}</strong> (Mã đơn: #${bookingId.slice(-6).toUpperCase()}) của bạn đã bị hủy.</p>
            <p>Lý do: ${booking.cancellation_reason || 'Nhà cung cấp không thể xác nhận dịch vụ.'}</p>
            <p>Bộ phận chăm sóc khách hàng của TourZen sẽ liên hệ với bạn trong thời gian sớm nhất để hỗ trợ các phương án thay thế hoặc tiến hành hoàn tiền (nếu bạn đã thanh toán).</p>
            <p>Xin lỗi vì sự bất tiện này và mong bạn thông cảm.</p>
            <hr>
            <p style="font-size: 0.8em; color: #666;">Đây là email tự động, vui lòng không trả lời.</p>
        `;
    }

    // Gửi yêu cầu đến API route '/api/send-booking-email'
    try {
        const response = await fetch('/api/send-booking-email', { // <<< Đảm bảo API route này tồn tại và hoạt động
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ to: customerEmail, subject: subject, html: emailBody, }),
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.error || 'Lỗi không xác định từ API gửi email'); }
        toast.success(`Đã gửi email "${newStatus === 'confirmed' ? 'Xác nhận' : 'Hủy'}" cho khách hàng!`);
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        toast.error(`Lỗi gửi email: ${error.message}`);
    }
};

// --- Hàm Cập nhật Stock và Thông báo NCC ---
const updateStockAndNotify = async (product, quantityChange, reason) => {
    if (!product || !product.id || !product.supplier_id) {
        console.warn("Thiếu thông tin sản phẩm hoặc NCC để cập nhật stock/thông báo.");
        return; // Không ném lỗi ở đây để các bước khác vẫn có thể tiếp tục
    }

    // Lấy stock hiện tại một cách an toàn
    let currentStock = 0;
    try {
        const { data: currentProduct, error: fetchError } = await supabase
            .from('Products')
            .select('stock, name')
            .eq('id', product.id)
            .single();
        if (fetchError || !currentProduct) { throw new Error("Lỗi fetch sản phẩm để cập nhật stock."); }
        currentStock = currentProduct.stock;
    } catch (fetchErr) {
        console.error(fetchErr);
        toast.error("Lỗi lấy stock hiện tại, không thể cập nhật.");
        throw fetchErr; // Ném lỗi để dừng quá trình nếu không lấy được stock
    }


    const newStock = currentStock + quantityChange;

    // Cập nhật stock
    const { error: stockError } = await supabase
        .from('Products')
        .update({ stock: newStock })
        .eq('id', product.id);

    if (stockError) {
        console.error("Lỗi cập nhật stock:", stockError);
        toast.error("Lỗi cập nhật số lượng tồn kho.");
        throw new Error("Lỗi cập nhật số lượng tồn kho."); // Ném lỗi để dừng
    }

    // Tạo thông báo cho NCC
    const message = `Cập nhật SL: ${reason}. Tour "${product.name}". Thay đổi: ${quantityChange > 0 ? '+' : ''}${quantityChange}. SL còn lại: ${newStock}.`;
    const { error: notifyError } = await supabase
        .from('Notifications')
        .insert({
            supplier_id: product.supplier_id,
            message: message,
            related_product_id: product.id,
            is_read: false
        });

    if (notifyError) {
        console.error("Lỗi tạo thông báo cho NCC:", notifyError);
        // Không ném lỗi ở đây, chỉ log và cảnh báo
        toast.error("Đã cập nhật stock nhưng lỗi tạo thông báo cho NCC.");
    } else {
        console.log(`Thông báo cập nhật stock đã gửi tới NCC ID: ${product.supplier_id}`);
    }
};


// --- Hàm Áp dụng Thay đổi Stock ---
const applyStockChanges = async (oldBooking, newBooking) => {
    const changes = [];
    // Hoàn trả stock nếu đơn cũ đã confirmed
    if (oldBooking && oldBooking.status === 'confirmed') {
        const oldProducts = getProductsFromBooking(oldBooking);
        for (const prod of oldProducts) {
            changes.push({ product: prod, delta: oldBooking.quantity, reason: `Hoàn trả từ đơn #${oldBooking.id.slice(-6).toUpperCase()}` });
        }
    }
    // Trừ stock nếu đơn mới được confirmed
    if (newBooking && newBooking.status === 'confirmed') {
        const newProducts = getProductsFromBooking(newBooking);
        for (const prod of newProducts) {
            // Kiểm tra stock trước khi trừ
            if (prod.stock < newBooking.quantity) {
                throw new Error(`Không đủ chỗ cho tour "${prod.name}". Còn lại: ${prod.stock}, cần: ${newBooking.quantity}`);
            }
            changes.push({ product: prod, delta: -newBooking.quantity, reason: `Xác nhận đơn #${newBooking.id.slice(-6).toUpperCase()}` });
        }
    }

    if (changes.length === 0) return; // Không có gì thay đổi

    // Thực hiện từng thay đổi stock và thông báo
    // Dùng Promise.all để chạy song song (nếu muốn) hoặc for...of để chạy tuần tự (an toàn hơn)
    try {
        for (const ch of changes) {
            await updateStockAndNotify(ch.product, ch.delta, ch.reason);
        }
    } catch (error) {
        console.error("Lỗi khi áp dụng thay đổi stock:", error);
        toast.error("Lỗi nghiêm trọng khi cập nhật số lượng tồn kho!");
        // Cần có cơ chế rollback hoặc báo lỗi rõ ràng cho admin
        throw error; // Ném lại lỗi để hàm gọi biết và xử lý (ví dụ: không đổi status)
    }
};


// --- Component Modal Thêm/Sửa Booking ---
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => {
    const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm loading state

    // Chỉ lấy tour đã approved và còn hàng (hoặc đang sửa đơn đã có tour đó)
    const tours = useMemo(() => allProducts.filter(p =>
        p.product_type === 'tour' &&
        (p.stock > 0 || p.id === booking?.main_tour?.id) // Cho phép chọn lại tour đang sửa dù hết hàng
    ), [allProducts, booking]);

    useEffect(() => {
        if (booking) {
            setFormData({
                user_id: booking.user_id || '',
                product_id: booking.main_tour?.id || '',
                quantity: booking.quantity || 1,
                status: booking.status || 'pending',
                id: booking.id
            });
        } else {
            setFormData({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
        }
        setError(''); // Reset lỗi khi mở modal
    }, [booking]);

    // Tính tổng giá
    useEffect(() => {
        const quantity = parseInt(formData.quantity, 10) || 0;
        let total = 0;
        const selectedTour = allProducts.find(p => p.id === formData.product_id);
        if (selectedTour) total += (selectedTour.price || 0) * quantity;
        setTotalPrice(total);
    }, [formData.product_id, formData.quantity, allProducts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Xóa lỗi khi người dùng thay đổi input
    };

    const handleSubmit = async (e) => { // <<< Thêm async
        e.preventDefault();
        setError('');
        if (!formData.user_id || !formData.product_id || !formData.quantity || formData.quantity <= 0) {
            setError('Vui lòng điền đủ thông tin (Khách hàng, Tour, Số lượng > 0).');
            return;
        }
        // Kiểm tra số lượng tồn kho trước khi lưu
        const selectedTour = allProducts.find(p => p.id === formData.product_id);
        if (!selectedTour) {
             setError('Tour không hợp lệ.');
             return;
        }
        // Cho phép lưu nếu là sửa đơn cũ và số lượng không đổi hoặc giảm
        const isEditingSameQuantityOrLess = booking && booking.main_tour?.id === formData.product_id && formData.quantity <= booking.quantity;
        if (selectedTour.stock < formData.quantity && !isEditingSameQuantityOrLess) {
            setError(`Không đủ chỗ. Tour "${selectedTour.name}" chỉ còn ${selectedTour.stock} chỗ.`);
            return;
        }


        setIsSubmitting(true); // Bật loading
        const dataToSave = {
            user_id: formData.user_id,
            product_id: formData.product_id,
            quantity: parseInt(formData.quantity, 10),
            total_price: totalPrice,
            status: formData.status,
            id: formData.id // Bao gồm cả id nếu là sửa
        };

        // Gọi hàm onSave (đã là async)
        try {
            await onSave(dataToSave, formData.id ? booking : null);
            // onClose(); // Hàm onSave sẽ tự đóng nếu thành công
        } catch (err) {
            // Lỗi đã được xử lý và toast trong onSave, không cần làm gì thêm ở đây
             setError(err.message || "Lỗi không xác định khi lưu."); // Hiển thị lỗi lại trên modal
        } finally {
            setIsSubmitting(false); // Tắt loading
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
             <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100">
                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white">{booking ? 'Sửa Đặt Tour' : 'Tạo Đặt Tour Mới'}</h3>
                    <button onClick={onClose} disabled={isSubmitting} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        {error && <p className="error-message">{error}</p>}
                        <div>
                            <label className="label-style">Khách hàng *</label>
                            <select name="user_id" value={formData.user_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn khách hàng --</option>
                                {allUsers.map(user => (<option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="label-style">Tour chính *</label>
                            <select name="product_id" value={formData.product_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn tour --</option>
                                {tours.map(product => (<option key={product.id} value={product.id}>{product.name} ({formatCurrency(product.price)}) - Còn: {product.stock}</option>))}
                                {/* Hiển thị tour đang chọn dù hết hàng */}
                                {booking && booking.main_tour && !tours.find(t=>t.id === booking.main_tour.id) && (
                                     <option key={booking.main_tour.id} value={booking.main_tour.id}>
                                         {booking.main_tour.name} ({formatCurrency(booking.main_tour.price)}) - Hết hàng
                                     </option>
                                )}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">Số lượng *</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-style">
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-2 border-t dark:border-neutral-700 mt-4">
                             <span className="text-lg font-semibold dark:text-white">Tổng cộng: </span>
                             <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                    {/* Footer Modal */}
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="modal-button-save flex items-center gap-1.5">
                            {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Xác nhận Xóa ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false); // Thêm loading state

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(booking);
            // onClose(); // Hàm onConfirm sẽ tự đóng nếu thành công
        } catch (err) {
            // Lỗi đã được toast trong onConfirm
        } finally {
            setIsDeleting(false);
        }
    };

    if (!booking) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
             <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300 scale-100">
                 <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                         <FaExclamationTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận Xóa Đặt Tour</h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                         <p>Bạn có chắc chắn muốn xóa đơn đặt tour #{booking.id.slice(-6).toUpperCase()}?</p>
                         {booking.status === 'confirmed' && <p className="font-semibold text-red-500 dark:text-red-400 mt-1">Số lượng tồn kho sẽ được hoàn trả.</p>}
                         <p className="mt-1">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-neutral-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="button" onClick={handleConfirm} disabled={isDeleting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50" >
                        {isDeleting ? <CircleNotch size={20} className="animate-spin" /> : 'Xác nhận Xóa'}
                    </button>
                    <button type="button" onClick={onClose} disabled={isDeleting} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-neutral-600 shadow-sm px-4 py-2 bg-white dark:bg-neutral-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50" >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};
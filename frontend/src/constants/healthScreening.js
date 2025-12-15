// Constants for health screening questionnaire
// Các mã code và nội dung câu hỏi khám sàng lọc sức khỏe

export const Q3_BENH_LY_TRUOC = {
  ung_thu: 'Ung thư',
  lao: 'Lao',
  benh_mau: 'Bệnh máu',
  benh_tam_than: 'Bệnh tâm thần',
  benh_than_kinh: 'Bệnh thần kinh',
  dau_tim: 'Đau tim',
  hen_suyen: 'Hen suyễn',
  benh_gan: 'Bệnh gan',
  benh_than: 'Bệnh thận',
  dai_thao_duong: 'Đái tháo đường',
  cao_huyet_ap: 'Cao huyết áp',
  benh_khac: 'Bệnh khác'
};

export const Q4_12_THANG = {
  Q4_1: 'Bị sốt rét?',
  Q4_2: 'Phẫu thuật, thủ thuật y khoa?',
  Q4_3: 'Được truyền máu, huyết tương, chế phẩm máu?',
  Q4_4: 'Thai sản, sẩy thai, phá thai, nạo hút thai?',
  Q4_5: 'Bú con dưới 12 tháng tuổi?',
  Q4_6: 'Tiêm vacxin phòng bệnh (ghi rõ loại vacxin)?',
  NONE: 'Không'
};

export const Q5_6_THANG = {
  Q5_1: 'Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tụy, viêm tủy xương?',
  Q5_2: 'Sút cân nhanh không rõ nguyên nhân?',
  Q5_3: 'Nổi hạch kéo dài?',
  Q5_4: 'Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi,..)?',
  Q5_5: 'Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?',
  Q5_6: 'Sử dụng ma túy?',
  Q5_7: 'Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?',
  Q5_8: 'Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?',
  Q5_9: 'Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?',
  Q5_10: 'Quan hệ tình dục với người cùng giới?',
  NONE: 'Không'
};

export const Q6_1_THANG = {
  Q6_1: 'Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết ly, tả, Rubella?',
  Q6_2: 'Đi vào vùng có dịch bệnh lưu hành (sốt rét, sốt xuất huyết, Zika,...)?',
  NONE: 'Không'
};

export const Q7_14_NGAY = {
  cam: 'Cảm cúm, cảm lạnh?',
  sot: 'Sốt?',
  tieu_chay: 'Tiêu chảy?',
  nhiet_mieng: 'Nhiệt miệng, loét miệng?',
  dau_rang: 'Đau răng, chảy máu chân răng?',
  viem_da: 'Viêm da?',
  di_ung: 'Dị ứng?',
  khac: 'Khác (ghi rõ)'
};

export const Q8_7_NGAY = {
  khang_sinh: 'Kháng sinh?',
  aspirin: 'Aspirin?',
  corticoid: 'Corticoid?',
  khac: 'Khác (ghi rõ)'
};

// Helper functions to get option text
export const getQ3Text = (code) => Q3_BENH_LY_TRUOC[code] || code;
export const getQ4Text = (code) => Q4_12_THANG[code] || code;
export const getQ5Text = (code) => Q5_6_THANG[code] || code;
export const getQ6Text = (code) => Q6_1_THANG[code] || code;
export const getQ7Text = (code) => Q7_14_NGAY[code] || code;
export const getQ8Text = (code) => Q8_7_NGAY[code] || code;

// Get all options as array for rendering
export const getQ3Options = () => Object.entries(Q3_BENH_LY_TRUOC);
export const getQ4Options = () => Object.entries(Q4_12_THANG);
export const getQ5Options = () => Object.entries(Q5_6_THANG);
export const getQ6Options = () => Object.entries(Q6_1_THANG);
export const getQ7Options = () => Object.entries(Q7_14_NGAY);
export const getQ8Options = () => Object.entries(Q8_7_NGAY);

// make-csv.js
import fs from 'fs';

// 1. Mock Data 생성 함수 (사용하시던 것)
const generateData = () => {
  const statuses = ['pending', 'processing', 'success', 'failed'];
  return Array.from({ length: 10000 }).map((_, i) => ({
    // ⚠️ 주의: Supabase에서 ID를 자동 생성(UUID/Auto Increment)한다면 아래 id 줄은 지우세요!
    // id: `ID-${i + 1}`, 
    amount: Math.floor(Math.random() * 1000) + 10,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    email: `user${i + 1}@example.com`,
    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  }));
};

const data = generateData();

console.log('🔄 CSV 변환 중...');

// 2. CSV 헤더 만들기 (Object의 키를 추출)
// 예: "amount,status,email,date"
const headers = Object.keys(data[0]).join(',');

// 3. CSV 행 만들기
const rows = data.map(obj => {
  return Object.values(obj).map(val => {
    // 혹시 데이터 안에 쉼표(,)가 있으면 CSV가 깨지므로 따옴표로 감싸줍니다.
    return `"${val}"`; 
  }).join(',');
}).join('\n');

// 4. 합치기
const csvContent = `${headers}\n${rows}`;

// 5. 파일 저장
fs.writeFileSync('payments.csv', csvContent, 'utf-8');

console.log('✅ payments.csv 파일 생성 완료! Supabase에 업로드하세요.');
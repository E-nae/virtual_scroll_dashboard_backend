import 'dotenv/config';
import express from 'express';
import cors from 'cors';
const app = express();
import { createClient } from '@supabase/supabase-js';

const port = process.env.PORT;

const allowedOrigins = [
    'http://localhost:3000',
    'virtual-scroll-dashboard-frontend.pages.dev',
    'https://project3.enaeble.co.kr',
];
  
app.use(cors({
    origin(origin, callback) {
        // 서버 → 서버 요청 (origin 없음)
        if (!origin) return callback(null, true);
    
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
    
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));


// Mock Data: 10,000건
// const generateData = () => {
//   const statuses = ['pending', 'processing', 'success', 'failed'];
//   return Array.from({ length: 10000 }).map((_, i) => ({
//     id: `ID-${i + 1}`,
//     amount: Math.floor(Math.random() * 1000) + 10,
//     status: statuses[Math.floor(Math.random() * statuses.length)],
//     email: `user${i + 1}@example.com`,
//     date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
//   }));
// };
// const allData = generateData();
/** 서버 깨우기 */
app.get('/health', (req, res) => {
    res.status(200).send({ok: true});
});

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

// API Endpoint
app.get('/api/payments', async (req, res) => {
    try {
        // 쿼리 스트링 파싱 (안전하게 문자열로 변환)
        const status = typeof req.query.status === 'string' ? req.query.status : 'all';
        const search = typeof req.query.search === 'string' ? req.query.search : '';
    
        console.log(`요청 받음 - Status: ${status}, Search: ${search}`);
    
        // 2. 쿼리 작성 시작 (SQL: SELECT * FROM payments)
        // .from('테이블이름').select('*')
        let query = supabase
            .from('mock-data') 
            .select('*', { count: 'exact' }); // count 옵션: 전체 개수
    
        // 3. 동적 필터링 적용 (조건이 있을 때만 체이닝)
        // Status 필터 (SQL: WHERE status = 'success')
        if (status && status !== 'all') {
            query = query.eq('status', status); // eq는 'Equal' (같다)
        }
    
        // 검색어 필터 (SQL: WHERE email ILIKE '%search%')
        if (search) {
            // ilike는 대소문자 구분 없이 검색 (Like Case-insensitive)
            // %는 앞뒤에 뭐가 붙든 포함되면 찾는다는 뜻
            query = query.ilike('email', `%${search}%`);
        }
    
        // 4. 정렬 및 개수 제한
        // 최신 날짜순 정렬
        query = query.order('date', { ascending: false });
        
        //Supabase는 기본적으로 1,000개까지만 리턴
        //Client-side Virtualization을 위해 데이터를 많이 가져오려면 범위를 늘려야 함.
        // 0번부터 9999번까지 (최대 10,000개) 가져오기
        query = query.range(0, 9999);
    
        // 5. 실제 요청 전송 (await)
        const { data, error, count } = await query;
    
        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: error.message });
        }
    
        console.log(`${data.length}건 데이터 반환`);
        res.json(data);
    
        } catch (err) {
            console.error('Server Error:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
  });
  
app.listen(port, () => {
    console.log(`Node.js Server running at ${port}port`);
});
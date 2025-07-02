
   import http from 'k6/http';
   import { sleep } from 'k6';

   export const options = {
     vus: 200,
     duration: '60s',
   };

   export default function () {
     const payload = { data: 'test' };
     const headers = { 'Content-Type': 'application/json' };
     
     if (Math.random() < 0.7) {
       const res = http.post('http://localhost:3000/jobs', JSON.stringify(payload), { headers });
       if (res.status === 200 && res.json().request_id) {
         sleep(0.1);
         http.get(`http://localhost:3000/jobs/${res.json().request_id}`);
       }
     } else {
       http.get('http://localhost:3000/jobs/test-request-id');
     }
     sleep(0.1);
   }
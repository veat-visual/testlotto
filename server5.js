const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const xlsx = require('xlsx');
// 엑셀 파일 읽기
const filePath = path.join(__dirname, 'lotto.xlsx'); // 현재 디렉토리 기준으로 절대 경로 생성
const filePath2 = path.join(__dirname, 'lotto2.xlsx');
const workbook = xlsx.readFile(filePath); // 절대 경로 사용
const workbook2 = xlsx.readFile(filePath2);
const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름
const sheetName2 = workbook2.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const sheet2 = workbook2.Sheets[sheetName2];

const jsonData = [
  ...xlsx.utils.sheet_to_json(sheet).map(row => ({ ...row, source: 'file1 1-600' })),  // 첫 번째 파일
  ...xlsx.utils.sheet_to_json(sheet2).map(row => ({ ...row, source: 'file2 601-today' })) // 두 번째 파일
];

// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱

//추가
const cors = require('cors');
app.use(cors());

//엑셀필터데이터
const data = jsonData.slice(2).map(row => {
    return ["__EMPTY_12", "__EMPTY_13", "__EMPTY_14", "__EMPTY_15", "__EMPTY_16", "__EMPTY_17"]
        .map(key => row[key] || null); // 각 키의 값 추출 (없으면 null)
});
//엑셀카운트데이터
const countdata = jsonData.slice(2).map(row => {
  return ["__EMPTY"]
      .map(key => row[key] || null); // 각 키의 값 추출 (없으면 null)
});
// 중복된 배열 찾기
const findDuplicates = (sendData) => {
  return data.reduce((result, row, index) => {
      if (row.every((value, i) => value === sendData[i])) {
          result.push({
              row,            // 중복된 배열 데이터
              key: countdata[index], // 해당 데이터의 키 값 (__EMPTY)
          });
      }
      return result;
  }, []);
};
// GET 요청: HTML 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
//포스트방식 API 요청: 중복 데이터 제공
app.post('/check', (req, res) => {
  const sendData = req.body.numbers; // 클라이언트에서 보낸 데이터
  console.log("받은 데이터:", sendData);
  const duplicatesWithKeys = findDuplicates(sendData);
  console.log("중복된 데이터와 키:", duplicatesWithKeys);
  // 중복된 데이터와 키를 반환
  res.json(duplicatesWithKeys);
});
// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

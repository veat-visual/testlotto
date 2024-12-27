const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const xlsx = require('xlsx');
// 엑셀 파일 읽기
const workbook = xlsx.readFile('lotto.xlsx');
const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름
const sheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(sheet); // 엑셀 데이터를 JSON으로 변환
// 미들웨어 설정
app.use(express.json()); // JSON 요청 본문 파싱
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

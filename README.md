### install
```bash
git clone https://github.com/ssoree912/MAIMHAIM-Appmanger-FE.git
```
```bash
npm install
```
```bash
npx react-native start
```

### branch
- deploy : apk 배포로 쓸 브랜치
- dev : feat, fix 등 각 브랜치의 작업이 완료되었을때 병합하는 브랜치
- feat : 새로운 기능을 추가하는 브랜치 
- fix : 버그 고치는 브랜치

>feat, fix 브랜치의 경우 /#이슈번호를 붙인다 따라서 이슈를 작성하고 어떤 내용을 개발할건지 작성 후 브랜치를 생성한다.
ex)feat/#1 , fix/#5


<summary>commit rule</summary>
<div markdown="1">

    <타입> : <제목>의 형식으로 제목을 아래 공백줄에 작성 
    - 제목은 50자 이내 / 변경사항이 "무엇"인지 명확히 작성 / 끝에 마침표 금지 
    예) feat : 로그인 기능 추가 
    - 바로 아래 공백은 지우지 마세요 (제목과 본문의 분리를 위함)  
    - 본문(구체적인 내용)을 아랫줄에 작성
    - 여러 줄의 메시지를 작성할 땐 "-"로 구분 (한 줄은 72자 이내) 

    init : 개발 환경 초기 세팅 
    feat : 새로운 기능 추가 
    fix : 버그 수정
    update : Fix와 달리 원래 정상적으로 동작했지만 보완의 개념
    remove : 파일을 삭제하는 경우
    move :코드나 파일을 이동하는 경우 
    rename : 파일 혹은 폴더명을 수정하는 경우
    docs : 문서를 수정한 경우 
    comment : 필요한 주석 추가 및 변경 
    refactor : 코드 리팩토링 (결과의 변경 없이 코드의 구조를 재조정, 가독성을 높임) 
    test : 테스트 코드
    chore : 그 외 자잘한 수정 

</div>
</details>


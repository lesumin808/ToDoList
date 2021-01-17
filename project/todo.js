const toDoForm = document.querySelector(".js-toDoForm"),
    toDoInput = toDoForm.querySelector("input"),
    clkEmp = document.querySelector(".empty"),
    toDoList = document.querySelector(".js-toDoList"),
    allList = document.querySelector(".All"),
    activeList = document.querySelector(".Active"),
    completeList = document.querySelector(".Completed"),
    develList = document.querySelector(".Developer"),
    todoheader = document.querySelector("#todo_header"),
    todoheader_count = document.querySelector(".count"),
    plus = document.querySelector(".Btn"),
    search = document.querySelector("#search"),
    m_gnb = document.querySelector(".m_gnb"), 
    del_btn = document.querySelector(".del_btn");

//로컬 로지스터에 저장소 객체 생성
const ALL_LS = 'allToDo',
    ACTIVE_LS = 'activeToDo',
    COMPLETED_LS = 'completedToDo';

//로컬 로지스터로 저장하기 위한 자바스크립트 배열 생성
let completedToDo = [],
    activeToDo = [],
    valueCount = [],
    allToDo = activeToDo.concat(completedToDo);

//menu변경을 위한 태그 생성
let h1 = document.createElement("h1");
let p = document.createElement("p");


//로컬로지스터로 저장가능한 stringfy
function saveToDos() {
    localStorage.setItem(ALL_LS, JSON.stringify(allToDo));
    localStorage.setItem(ACTIVE_LS, JSON.stringify(activeToDo));
    localStorage.setItem(COMPLETED_LS, JSON.stringify(completedToDo));
}

//초기화
function init() {
    h1.innerText = "All";//시작 시 All화면
    todoheader.appendChild(h1);
    todoheader_count.style.color = "#ff9f2b";
    loadTodos(); //리스트 목록 불러오기
    addEmpty(); //입력칸 display여부 불러오기
    only_m(); //mobile display 여부 불러오기
    todoheader_count.textContent = allToDo.length; //all화면 갯수 출력
    allToDo.forEach(toDo => paint(toDo)); //all리스트 html화면에 출력
    clkEmp.addEventListener("click", show_input); //empty칸 클릭시 입력칸 block
    toDoForm.addEventListener("submit", handleSubmit); //input submit 시 value값 가져오는 handleSubmit함수 호출
}

init();
//menu 클릭에 따른 함수 호출
allList.addEventListener("click", paintAll);
activeList.addEventListener("click", paintActive);
completeList.addEventListener("click", paintComplete);
develList.addEventListener("click", paintdevel);
search.addEventListener("keydown", paintSearch);
search.removeEventListener("keyup", paintAll);
m_gnb.addEventListener("click", viewSidebar);

//input에 submit이벤트 발생 시 값을 loadTodos로 전달
function handleSubmit(event) {
    event.preventDefault();
    const currentValue = toDoInput.value;
    paintToDo(currentValue);//painToDo에 현재 값 전달
    toDoInput.value = "";//input 초기화
    toDoForm.style.display = "none";
    loadTodos();
}

//로컬로지스터값 -> 자바스크립트 값
//html list출력을 위하여 배열에 전달
function loadTodos() {
    const loadedToDos = localStorage.getItem(ALL_LS);
    if (loadedToDos !== null) {
        const parsedToDos = JSON.parse(loadedToDos);

        allToDo = parsedToDos;
        completedToDo = parsedToDos.filter(toDo => toDo.isDone === true);//isDone여부로 complete와 active 배열 구분
        activeToDo = parsedToDos.filter(toDo => toDo.isDone === false);
        showCount(); //load와 동시에 count를 할 수 있게 함수 호출
    }
}

//All화면 시 출력
function paintAll() {
    only_m();
    changeMenu("All", "#ff9f2b", allToDo.length);
    allToDo.forEach(toDo => paint(toDo));//allToDo 배열 안의 값 -> paint(html list 출력)
    addEmpty();
}

//Active화면 시 출력
function paintActive() {
    only_m();
    changeMenu("Active", "#0084fb", activeToDo.length);
    activeToDo.forEach(toDo => paint(toDo));//activeToDo 배열 안의 -> paint(html list 출력)
    addEmpty();
}

//Complete 시 출력
function paintComplete() {
    only_m();
    addEmpty();
    changeMenu("Completed", "#ecb5af", completedToDo.length);
    completedToDo.forEach(toDo => compPaint(toDo));//completedToDo 배열 안의 값 -> paint함수(html list 출력)
    del_btn.addEventListener("click", deleteToDo);//삭제 버튼 시 -> deleteToDo(전체삭제)
}

//developer 시 출력
function paintdevel() {
    only_m();
    addEmpty();
    changeMenu("Developer", "#4a9459", "4");
}

//검색 시 Serach화면 출력
function paintSearch() {
    only_m();
    addEmpty();
    filter();//일치하는 검색어 출력 함수
    changeMenu("Search", "#e9dfc8", valueCount.length);
    allToDo.forEach(toDo => paint(toDo));
}

//기존 리스트 출력함수
function paint(obj) { 
    const li = document.createElement("li");//node 생성
    const btn = document.createElement("button");
    const span = document.createElement("span");
    span.addEventListener("click", editTodo);//버튼클릭 시 함수연결
    span.innerText = obj.text;
    li.appendChild(btn);
    li.appendChild(span);
    li.id = obj.id;
    toDoList.appendChild(li);
    //isDone여부로 버튼 기능 분기 처리
    if (obj.isDone === false) {// 체크 안 된 상태
        btn.addEventListener("click", doneToDo);
    }
    else if (obj.isDone === true) {// 체크 된 상태 (all)
        btn.addEventListener("click", againToDo);
        li.classList.add("complete")
    }
}

//신규 생성 시 출력 함수(active)
function paintToDo(text) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.addEventListener("click", doneToDo);
    const span = document.createElement("span");
    span.addEventListener("click", editTodo);
    const newId = allToDo.length + 1;
    if (!noValue(text)) {
        span.innerText = text;
        li.appendChild(btn);
        li.appendChild(span);
        li.id = newId;
        toDoList.appendChild(li);
        const toDoObj = {
            text: text,
            id: newId,
            isDone: false
        };
        allToDo.push(toDoObj);
        activeToDo.push(toDoObj);
        saveToDos();
    }
}

//complete 출력 함수(complete)
function compPaint(obj) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.addEventListener("click", againToDo); search
    const span = document.createElement("span");
    span.addEventListener("click", editTodo);
    span.innerText = obj.text;
    li.appendChild(btn);
    li.appendChild(span);
    li.id = obj.id;
    li.classList.add("complete");
    toDoList.appendChild(li);
}

//complete -> active
function againToDo(event) {
    const bnt = event.target;
    const li = bnt.parentNode;
    const d = allToDo.find(toDo => toDo.id === parseInt(li.id));
    //ALL화면일 시 complete와 active 분기 처리
    if (h1.innerText === "All") {
        if (li.classList.contains("complete")){
            li.classList.remove("complete");
            d.isDone = false;
        }
        else{
            li.classList.add("complete");
            d.isDone = true;
        }
    }
    const idx = allToDo.findIndex(toDo => toDo.id === parseInt(li.id)); // 
    if (idx > -1) completedToDo.splice(idx, 1);//만약 동일한 아이디가 존재할 시 completedToDo배열에서 삭제
    saveToDos();
    loadTodos();
}

//active -> complete
function doneToDo(event) {
    const bnt = event.target;
    const li = bnt.parentNode;
    const d = allToDo.find(toDo => toDo.id === parseInt(li.id));
    //ALL화면일 시 complete와 active 분기 처리
    if (h1.innerText === "All") {
        if (li.classList.contains("complete")){
            li.classList.remove("complete");
            d.isDone = false;
        }
        else{
            li.classList.add("complete");
            d.isDone = true;
        }
    }
    const idx = allToDo.findIndex(toDo => toDo.id === parseInt(li.id)); //Allto에서 일치하는 id값 찾기
    if (idx > -1) activeToDo.splice(idx, 1);//만약 동일한 아이디가 존재할 시 activeToDo배열에서 삭제
    saveToDos();
    loadTodos();
}

//리스트 클릭시 수정
function editTodo(event) {
    const span = event.target;
    const li = span.parentNode;
    const d = allToDo.find(toDo => toDo.id === parseInt(li.id));
    // span display none -> input block -> 글자 수정 -> 엔터 ( 저장 )
    span.style.display = 'none';
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "text";
    input.value = d.text;
    input.autofocus;
    input.style = "color: white; border: none; background: transparent;  font-size: 30px;";
    li.appendChild(form);
    form.appendChild(input);
    form.addEventListener("submit", function () {
        event.preventDefault();
        if (!noValue(input.value)) {
            d.id = d.id;
            d.text = input.value;
            span.innerText = input.value;
        };
        li.removeChild(form);
        span.style.display = 'block';
        //저장 
        input.value = "";
        toDoForm.style.display = "none";
        saveToDos();
    });

}

//전체 삭제
function deleteToDo(event) {
    while (toDoList.hasChildNodes()) {
        toDoList.lastChild.remove();
    };
    allToDo = allToDo.filter(todo => !completedToDo.includes(todo));
    completedToDo = [];
    saveToDos();
    loadTodos();
}

//검색어 필터 -> index.html - .serch onkeyup에서 filter()호출
function filter() {
    valueCount = [];
    const value = document.getElementById("search").value.toUpperCase();
    for (let i = 0; i < toDoList.childElementCount; i++) {
        if (toDoList.children[i].innerText.toUpperCase().indexOf(value) > -1) {
            toDoList.children[i].style.display = "flex";
            valueCount.push(value);
        } else
            toDoList.children[i].style.display = "none";
    }
}

function show_input() {
    toDoForm.style.display = "block";
}

// 모바일 - 사이드바 열기
function viewSidebar() {
    document.getElementById("content").style.display = "none";
    document.getElementById("sidebar").style.display = "block";
    openview = true;// -> 모바일 시 true
}

//값 유효성검사
function noValue(value) {
    if (value == "" || value == " " ||value == null || value == undefined || (value != null && typeof value == "object" && !Object.key(value).length))
        return true;
    else
        return false;
}

// body안에 전체를 감싸고 있는 wrap을 div를 객체생성 -> 클릭시 갯수를 출력 
// showCount를 호출 
function showCount() {
    document.getElementById("wrap").addEventListener("click", showCount);
    let toDocount = todoheader.firstElementChild;
    let alleng = allToDo.length;
    let active = activeToDo.length;
    let compl = completedToDo.length;
    if (h1.textContent == "Active")
        toDocount.textContent = active;
    else if (h1.textContent == "Completed")
        toDocount.textContent = compl;
    else if (h1.textContent == "All")
        toDocount.textContent = alleng;
    document.getElementById("all").textContent = alleng;
    document.getElementById("active").textContent = active;
    document.getElementById("completed").textContent = compl;
}

//h1(메뉴.inner text 값으로 배열 개수 및 메뉴 텍스트 출력
function changeMenu(menu, color, count) {
    const newh1 = document.createElement("h1");
    newh1.innerText = menu;
    todoheader.replaceChild(newh1, h1);
    todoheader_count.textContent = count;
    h1 = newh1;
    h1.style.color = color;
    todoheader_count.style.color = color;
    while (toDoList.hasChildNodes()) {
        toDoList.lastChild.remove();
    };
    addEmpty();

    loadTodos();

}

//메뉴에 따른 emplty 블락 처리
function addEmpty() {
    if (h1.innerText === "Completed")    // completed 를 제외한 모든 메뉴에선 del_btn 제거
        del_btn.style.display = "block";
    else
        del_btn.style.display = "none";

    if (h1.textContent == "Active" || h1.textContent == "All") {  // All 과 Active 일때만 empty와 puls활성 
        clkEmp.style.display = "block";
        plus.style.display = 'block';
    } else {
        clkEmp.style.display = "none";
        toDoForm.style.display = "none";
        plus.style.display = 'none';
    }  
    if(h1.innerText == "Developer"){
        $("#member-Area").show();
    }else{
        $("#member-Area").hide();
    }
}

//모바일 시(openview = true) block처리
function only_m() {
    if (openview = true) {
        document.getElementById("content").style.display = "block";
        document.getElementById("sidebar").style.display = "none";
    }
    document.getElementById("content").style.display = "block";
    document.getElementById("sidebar").style.display = "block";

}


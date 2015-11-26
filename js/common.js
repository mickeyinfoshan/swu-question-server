//将新问题放入questions数组中
function pushQuestion(questions, newQuestion) {
  newQuestion.text = newQuestion.text.replace(/(\.|。)$/,'？');
  if (questions.length == 0) {
    questions.push(newQuestion);
    return questions;
  }
  for (var questionIndex = 0; questionIndex < questions.length; questionIndex++) {
    question = questions[questionIndex];
    //console.log(newQuestion);
    if (newQuestion.text == question.text) {
      if (newQuestion.label != question.label)
        question.label += (" | " + newQuestion.label);
      break;
    }
    if (questionIndex == questions.length - 1)
      questions.push(newQuestion);
  }
  return questions;
}

//把收到的对象中每个字拼接到一起，cont属性对应分词后的字
function getSentenceContent(sentence) {
  var str = '';
  for (var i = 0; i < sentence.length; i++) {
    str += sentence[i].cont;
  }
  return str;
}

//移除括号
function removeBrace(text) {
  var lbz = text.indexOf('（');
  var lby = text.indexOf('(');
  while (lbz >= 0 || lby >= 0) {
    if (lbz >= 0) {
      var rb = text.indexOf('）');
      var lb = lbz;
    } else {
      rb = text.indexOf(')');
      lb = lby;
    }
    text = text.substring(0, lb) + text.substring(rb + 1);
    lbz = text.indexOf('（');
    lby = text.indexOf('(');
  }
  return text;
}

//创建Excel
// (function CreateExcel() {
//   //document.expando是IE老版本专有属性，'-ms-scroll-limit'是IE11所有
//   if (!!window.ActiveXObject || '-ms-scroll-limit' in document.documentElement.style) {
//     oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel 
//     oWB = oXL.Workbooks.Add(); //获取workbook对象 
//     oSheet = oWB.ActiveSheet; //激活当前sheet 
//     currQuestion = 1;
//     sentenceId = 1;
//   }
// })();

//将产生的问题放入Excel中
function CreateData(sentence, questions) { //读取表格中每个单元到EXCEL中 
  if (questions.length == 0) {
    return;
  }
  var pos = 0;
  for(var i=0; i< sentence.length; i++) {
    if(sentence[i].pos == 'wp') {
      pos++;
    }
  }

  //var shortSentences = sentenceSlimplifer(sentence) || [];

  // 所有问题的集合
  var questionData = [];

  //1:句子长度 2:短句数 3:是否提取 4:问句类型
  for (var questionIndex = 0; questionIndex < questions.length; questionIndex++) {
    var questext = questions[questionIndex].text;
    var item = questionData[questionIndex] = {};

    // 每个问题的原句，问题和特征
    item.sentence = getSentenceContent(sentence);
    item.quest = questext;
    item.Feature1 = questext.length;
    item.Feature2 = pos;
    item.Feature3 = Number(isNew);
    item.Feature4 = outLabel(questions[questionIndex].label);
    //item.shortSentence1 = shortSentences[0];
    //item.shortSentence2 = shortSentences[1];
  }

  return questionData;
}

//输出Excel
function OutExcel() {
  try {
    var fname = oXL.Application.GetSaveAsFilename("question.xls", 'Excel Spreadsheets(*.xls),*.xls');
    console.log('true');
  } catch (error) {
    console.log(error);
  } finally {
    if (fname) {
      oWB.SaveAs(fname);
      oWB.Close(savechange = false);
      oXL.Quit();
      oXL = null;
    } else {
      console.log('导出失败');
    }

    window.setTimeout(function () {
      CollectGarbage();
    }, 1);
  }
}

function outLabel(label) {
    if(label=='人名') {
        return 1;
    }
    if(label=='机构名') {
        return 2;
    }
    if(label=='地名') {
        return 3;
    }
    if(label=='地点状语') {
        return 4;
    }
    if(label=='时间状语') {
        return 5;
    }
    if(label=='动作施事类') {
        return 6;
    }
    if(label=='数字型') {
        return 7;
    }
    if(label=='持续时间') {
        return 8;
    }
}

function filterQuestionMark(sentence) {
  if (sentence[sentence.length - 1].cont == '？' || sentence[sentence.length - 1].cont == '?') {
    sentence = '';
    return sentence;
  } else {
    return sentence;
  }
}


var fileRead = $("#fileRead");
var upload = $("#upload");
var textarea = $("#text");

fileRead.on('mousemove', function() {
  upload.addClass('hover');
});
fileRead.on('mouseout', function() {
  if(upload.hasClass('hover')) {
    upload.removeClass('hover');
  }
});
fileRead.on('change', function(event) {
  event.preventDefault();
  files = event.target.files;
  console.log(files[0]);
  type = 'default';
  reader = new FileReader();
  if(/text/.test(files[0].type)) {
    var title = files[0].name.split('.')[0];
    reader.readAsText(files[0], 'UTF-8');
    type = 'text';
  }
  reader.onload = function() {
    switch(type) {
      case 'text':
        var encodeValue = encodeURI(reader.result);
        textarea.text(decodeURI(encodeValue));
        $('#articalTitle').text(title);
        break;
    }
  };
});


//var dataSets = [];

// 将结果Json化传给服务端
function saveToServer(dataSets) {

    if(socket) {

      var csv = Papa.unparse(dataSets, {
        quotes: false,
        delimiter: "\t",
        newline: "\r\n"
      })

      socket.emit('file quest', csv);

    }else {
      console.log('no socket');
    }


  $('.saveData').on('click', function() {
    dataSets.push({
      type: $("input[name='titleType']:checked").val(),
      artical: $("#text").val(),
      title: $('#articalTitle').text() || title
    })
    if(!$("input[name='titleType']:checked").val()) {
      alert('文章类型不能为空');
      return false;
    }
    console.log(dataSets);
    $.ajax({
      type: "POST",
      url: '',
      data: dataSets
    }).then(function(data) {
      //console.log('success and callback data is ' + data);
    })
  })
}

//nodejs读取文件夹
var socket = io();

$('.readFile').on('click', function() {


  socket.emit('read file', 'test');

  socket.on('read file', function(msg){
    if(typeof msg !== 'string') {
      //文章读取完毕
      //saveToServer({end: true});
    }else {
      analyze(msg);

    }
  });

})


/**
 * Created by mwq on 2015/3/28.
 */

// 原文章
var artical = '',
    title = '';

$('.produce').on('click', function() {
  analyze($('#text').val())
})

function analyze(text) {
  var base = "http://ltpapi.voicecloud.cn/analysis/?",
    api_key = "n2T5b2L8XA0sMuSEJlQwZZqNxtDkdxJIEccA9Ree",
    element = $("#pattern"),
    pattern = 'all',
    format = "json";

  var artical = text || removeBrace($('#text').val().replace(/(\s|\u00A0)+/g,"")).toUpperCase();
  if(!artical) {
    return false;
  }

  var uri = (base
    + "api_key=" + api_key + "&text=" + artical
    + "&pattern=" + pattern + "&format=" + format
    + "&callback=" + "successCallBack");

  $.ajax({
    type: "POST",
    async: false,
    dataType: 'jsonp',
    url : uri,
    success: successCallBack,
    error : function(err) {
      console.log(err);
    }
  });

  $('#originText').html('分析中，请耐心等候');
  $('#questions').html('');
}


// 请求成功的回调函数，
function successCallBack(d) {
  $('#originText').html('');
  $('.row:last').addClass('bgw');
  //获取的数据data[[[{}]]],所以data[0][n]才是要用的数据
  var paragraph = d[0];

  var dataSets = [];
  for (var sentenceIndex = 0; sentenceIndex < paragraph.length; sentenceIndex++) {
    var sentence = paragraph[sentenceIndex];
    var p = document.createElement('p');
    p.className = "sentence";
    //拼接分词后的字放回到#originText中
    var InitSentence = getSentenceContent(sentence);
    p.innerHTML = InitSentence;
    
    $('#originText').append(p);
    (function () {
      var s = sentence;
      p.onclick = function (e) {
        questions = generateQuestionBySentence(s);
        showQuestions(questions);
        $('p').removeClass('sentence-selected');
        e.target.className = "sentence sentence-selected"
      };
    })();
    $('.sentence')[0].click();
    var questions = generateQuestionBySentence(sentence);
    dataSets = dataSets.concat(CreateData(sentence,questions));  
  }

  //取文章第一个短句为title 
  for(var titleIndex = 0, len = paragraph[0].length; titleIndex < len; titleIndex++) {
    if(paragraph[0][titleIndex].pos === 'wp') {
      break;
    }
    title += paragraph[0][titleIndex].cont;
  }
  
  saveToServer(dataSets)
}

//srl: 语义角色标注; pos: 词性标注; last: 持续; mq: 数字;根据句子得到问题的集合
function generateQuestionBySentence(sentence) {
  var questions = [];
  var sentence = wipeNeedlessComponent(sentence);
  var srlQuestions = srlGenerateQuestionsBySentence(sentence);
  var posQuestions = posGenerateQuestionsBySentence(sentence);
  var lastQuestions = lastQuestionsBySentence(sentence);
  var mqQuestions = mqQuestion(sentence);
  for (var i = 0; i < srlQuestions.length; i++) {
    questions = pushQuestion(questions, srlQuestions[i]);
  }
  for (i = 0; i < posQuestions.length; i++) {
    questions = pushQuestion(questions, posQuestions[i]);
  }
  for (i = 0; i < lastQuestions.length; i++) {
    questions = pushQuestion(questions, lastQuestions[i]);
  }
  for (i = 0; i < mqQuestions.length; i++) {
    questions = pushQuestion(questions, mqQuestions[i]);
  }
  return questions;
}


//出现问题
function showQuestions(questions) {
  $('#questions').html('');
  if (questions.length == 0) {
    var alertDiv = $('<div></div>');
    alertDiv.addClass('alert');
    alertDiv.addClass('alert-warning');
    alertDiv.html('抱歉，该句不能产生问题');
    $('#questions').append(alertDiv);
  }
  for (var i = 0; i < questions.length; i++) {
    var question = questions[i];
    var p = document.createElement('p');
    p.innerHTML = question.text;
    var label = document.createElement('span');
    label.innerHTML = question.label;
    label.className = "label label-info";
    p.appendChild(label);
    $("#questions").append(p);
  }
}





// 读取cdv文件并生成问题
$('#csvRead').on('change', function(event) {
  event.preventDefault();
  file = event.target.files[0];

  Papa.parse(file, {
    complete: function(results) {
      var data = results.data, text = '';
      for(var i = 0, _l = data.length-1; i < _l; i++) {
        var item = data[i];
        for(var j = 0, l = item.length; j < l; j++) {
          //text += item[j];
          //每篇文章都走一遍analyze
          analyze(item[j]);
        }
      }

      //console.log(text);
    }
  });

});





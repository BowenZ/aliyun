var resetPreview;
(function(){
	var app = angular.module('huanjun-app', []);

	app.controller('FilterController', function($scope){
		this.questions = [
			{type:'radio', title: '阿三', options: [{option:'aaa', checked: false}, {option:'bbb', checked: true}, {option:'ccc', checked: false}], explain: 'qqq', time: '2015-1-05'},
			{type:'checkbox', title: '阿去', options: [{option:'aaa', checked: true}, {option:'bbb', checked: true}, {option:'ccc', checked: false}], explain: 'qqq', time: '2015-3-05'},
			{type:'radio', title: '阿是', options: [{option:'aaa', checked: false}, {option:'bbb', checked: false}, {option:'ccc', checked: true}], explain: 'qqq', time: '2015-5-05'},
			{type:'radio', title: '阿放', options: [{option:'aaa', checked: false}, {option:'bbb', checked: true}, {option:'ccc', checked: false}], explain: 'qqq', time: '2015-7-05'}
		];
		function dateFormate(str){
			var arr = str.split(/-|\//g);
			return (new Date(-28800000)).setFullYear(arr[0],arr[1]-1,arr[2]);
		}
		$scope.dateFilter = function(obj){
 			return ($scope.queryDate1?(dateFormate(obj.time) >= $scope.queryDate1):true) && ($scope.queryDate2?(dateFormate(obj.time ) <= $scope.queryDate2):true);
		}
	});

    app.controller('NewQuestionController', function($scope){
        var self = this;
        self.options = [];
        self.addOption = function(){
            self.options.push(self.option);
            self.option = '';
        }
        resetPreview = function(){
            self.options = [];
            $scope.$apply();
        }
    });
})();

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return "";
}
 
function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}
 
function delCookie(name) { //为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = name + "=a; expires=" + date.toGMTString();
}

var $shade = $('.shade'),
	$alert = $('.shade .alert'),
	$loadingIcon = $('.loading-icon');

if(!!getCookie('huanjunLogInfo')){
	var logInfo = JSON.parse(getCookie('huanjunLogInfo'));
	logInfo.password = (new Base64()).decode(logInfo.password);
	// console.log(logInfo);
	$.getJSON('http://121.41.27.97:3000/heapot/user/login?jsonpcallback=?', {name: logInfo.username, password: logInfo.password, company: 'question'}, function(data) {
		if(data == 0){
			//用户不存在
			$alert.find('.info').text('用户不存在！');
			$alert.show(200);
		}else if(data == 2){
			delCookie('huanjunLogInfo');
			$alert.find('.info').text('密码错误！');
			$alert.show(200);
		}else{
			$('.shade').hide(600);
			$('.shade').find('input').val('')
		}
	});
}

$(document).ready(function() {
	$alert.find('button').click(function() {
		$alert.hide(200);
	});
    $('.shade form').bootstrapValidator({
    	message: '信息不合法',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: '用户名不能为空'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    }
                }
            }
        },
        submitHandler: function(validator, form, submitButton){
        	var username = $(form).find('input[name="username"]').val(),
        		password = $(form).find('input[name="password"]').val();
        	$.getJSON('http://121.41.27.97:3000/heapot/user/login?jsonpcallback=?', {name: username, password: password, company: 'question'}, function(data) {
        		if(data == 0){
        			//用户不存在
        			$alert.find('.info').text('用户不存在！');
        			$alert.show(200);
        		}else if(data == 2){
        			delCookie('huanjunLogInfo');
        			$alert.find('.info').text('密码错误！');
        			$alert.show(200);
        		}else{
        			if($shade.find('input:checkbox').is(':checked')){
        				var base64 = new Base64();
        				password = base64.encode(password);
        				setCookie('huanjunLogInfo', JSON.stringify({
        					username: username,
        					password: password
        				}), 30);
        			}
        			$('.shade').hide(600);
        			$('.shade').find('input').val('')
        		}
        	});
        }
    });
	$('#pwdModal form').bootstrapValidator({
    	message: '信息不合法',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            oldPwd: {
            	trigger: 'blur',
                validators: {
                    notEmpty: {
                        message: '原密码不能为空'
                    }
                }
            },
            newPwd1: {
            	trigger: 'blur',
                validators: {
                    notEmpty: {
                        message: '新密码不能为空'
                    }
                }
            },
            newPwd2: {
            	trigger: 'blur',
                validators: {
                    notEmpty: {
                        message: '确认新密码不能为空'
                    },
                    callback: {
                    	message: '两次密码不一致',
                    	callback: function(value, validator){
                    		return value === newPwd1.value;
                    	}
                    }
                }
            }
        },
        submitHandler: function(validator, form, submitButton){
        	$loadingIcon.css('visibility', 'visible');
        	$.getJSON('http://localhost:3000/heapot/user/changepwd?jsonpcallback=?', {oldPwd: oldPwd.value, newPwd: newPwd1.value, company: 'question'}, function(data) {
        		$loadingIcon.css('visibility', 'hidden');
        		if(data == 0){
        			alert('修改失败：原密码不正确！');
        		}else if(data == 2){
        			alert('修改失败：请刷新页面重试');
        		}else{
        			alert('修改成功');
        		}
        	});
        }
    });
    $('#newModal form').bootstrapValidator({
        message: '信息不合法',
        fields: {
            type: {
                validators: {
                    notEmpty: {
                        message: '请选择题目类型'
                    }
                }
            },
            answers: {
                validators: {
                    callback: {
                        message: '请至少添加两个选项并选中答案',
                        callback: function(value, validator){
                            return ($('.answer-preview li').length > 0);
                        }
                    }
                }
            },
            title: {
                validators: {
                    notEmpty: {
                        message: '请填写题目'
                    }
                }
            },
            explain: {
                validators: {
                    notEmpty: {
                        message: '请填写答案解释'
                    }
                }
            }
        },
        submitHandler: function(validator, form, submitButton){
            if($('.answer-preview li').length < 2){
                alert('请至少添加两个选项');
                $(submitButton).attr('disabled', false);
                return false;
            }else if($('.answer-preview input:checked').length < 1){
                alert('请选择答案');
                $(submitButton).attr('disabled', false);
                return false;
            }
            $loadingIcon.css('visibility', 'visible');
            var $form = $('#newForm');
            var questionData = {}, arr = [];
            questionData.type = $form.find('input[name="type"]:checked').val();
            questionData.title = $form.find('input[name="title"]').val();
            $('.answer-preview li').each(function(index, ele){
                arr.push({
                    option:$(ele).find('.option-copy').text(),
                    checked: $(ele).find('input').is(':checked')
                })
            });
            questionData.options = JSON.stringify(arr);
            questionData.explain = $form.find('input[name="explain"]').val();
            $.post('admin/addquestion', questionData, function(data, textStatus, xhr) {
                if(data == 'success')
                    alert('添加成功');
                else
                    alert('添加失败');
                $loadingIcon.css('visibility', 'hidden');
                $(form).find('input,textarea').val('');
                resetPreview();
                validator.resetForm();
            });
            return false;
        }
    });
	function bindEvents(){
		$('.logout').click(function() {
			$shade.show(200);
		});
		$('#changePwd').click(function() {
			var oldPwd = $('#pwdForm');
		});
        $shade.find('input').on('focus change', function() {
            $alert.hide();
        });
	}
    function initUpload(){
        $("#uploadButton").click(function() {
            $("#progressBar").attr("style", "width: 0%").attr("aria-valuenow", "0");
            var files = document.getElementById("fileInput").files;
            var formData = new FormData(document.forms.namedItem("fileinfo"));
            //formData.append('files', files);
            var xhr;
            if (window.ActiveXObject) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } else if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            }
            xhr.open("POST", "/heapot/question/admin/upload", true);
            xhr.onload = function(event) {
                console.log(xhr.responseText);
            };
            xhr.upload.addEventListener("progress", progressFunction, false);
            xhr.send(formData);

            function progressFunction(evt) {
                var progressBar = document.getElementById("progressBar");
                if (evt.lengthComputable) {
                    var value = Math.floor((evt.loaded / evt.total) * 100);
                    $("#progressBar").attr("style", "width: " + value + "%").attr("aria-valuenow", value);
                    if (value == 100) {
                        $("#progressBar").removeClass("progress-bar-warning").addClass("progress-bar-success");;
                    }
                }
            }
        });
    }
	bindEvents();
    initUpload();
});

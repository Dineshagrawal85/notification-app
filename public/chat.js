//angular.app("sampleApp").controller("sampleController")
var sampleApp = angular.module('sampleapp',  ['angular-notification-icons','angular-click-outside','ui.router','ngCookies','LocalStorageModule'])

sampleApp.config(function($stateProvider, $urlRouterProvider) {
    //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");
  //
  // Now set up the states 

  $stateProvider
    .state('state1', {
      url: "/home",
      params:{
        "user_name": null
      },
      templateUrl: "templates/home.html",
      controller: 'samplecontroller'
    })
    .state('state2', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'logincontroller'
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "templates/signup.html",
      controller: 'signupController'
    })
});

sampleApp.controller('mainCtrl',function($scope, $http,localStorageService){
    localStorageService.set("key","swswswsws")
    console.log(":localStorageService",localStorageService.get("key"))

})
sampleApp.controller('logincontroller',function($scope,$http,$state,$cookieStore){
  
    $scope.message =  "login";
    $scope.errorMessage = ""
    $cookieStore.put('user_info',undefined)
    $scope.submit=function()
      {
        $http.post('/login', $scope.user)
        .success(function(data) {
            //$scope.form1 = {};
            //$state.go('state1');
            console.log(":data",data)
            if(data.statusCode ==1){
                if(data.loggedIn){
                    var user_info = data.userDetail
                    $cookieStore.put('user_info',user_info)
                    $state.go('state1',{"user_name":$scope.user.name});
                }else{
                    $scope.errorMessage = data.Message
                }
            }else{
                console.log(":Internal Server Error")
                $scope.errorMessage = "Internal Server Error. Please try after some time"
            }
        })
        .error(function(error) {
          //$state.go('state1');
            //console.log('Error: ' + error);
            $scope.errorMessage = "Internal Server Error. Please try after some time"
        });
        /*if($scope.user.user == "samar"){
            user_id = 1
            img_url = "image6.jpg"
        }else if ($scope.user.user == "ravindra"){
            user_id = 2
            img_url = "image1.jpg"
        }else{
            user_id = 3
            img_url = "image2.jpg"
        }
        var user_info = {"user_name":$scope.user.user,"user_id":user_id,"img_url":img_url}
        $cookieStore.put('user_info',user_info)
        $state.go('state1',{"user_name":$scope.user.user});*/
  }
      
});

sampleApp.controller('signupController',function($scope, $http,localStorageService){
    console.log("signupcontroller")
    $scope.registerUser = function(){
        console.log("$scope.user",$scope.user)
        var fd = new FormData();
        fd.append('file', $scope.myfile);
        fd.append("user",$scope.user.username)
        fd.append("password",$scope.user.password)
        //console.log(fd);
        $http.post('signup', fd ,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
          console.log("Success call");
        })
        .error(function(err){
            console.log(":err",err)
        });
    }
})


sampleApp.controller('samplecontroller',function($scope, $http,$state,$cookieStore,$compile){
//window.onload = function() {
    console.log(":called")
    console.log(":$state.params.user_name",$state.params.user_name)
    console.log(":$cookieStore.get user_name",$cookieStore.get('user_name1'))
    if($cookieStore.get('user_info') == undefined){
        return $state.go('state2')
    }
    $scope.user_info = $cookieStore.get("user_info")
    console.log("$scope.user_info",$scope.user_info)
    var messages = [];
    var socket = io.connect('/');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    $scope.clientId = ""
    $scope.count = 10
    $scope.notification = {}
    $scope.messageObj = {count:0,
        list:[]}
    $scope.activeSockets = []
    $scope.showList = false
    $scope.chatProposals = []
    $scope.privateChatSession = {"enable":false}
   /* setTimeout(function(){
        $scope.count = 20
    },10000)*/
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
            $scope.$apply(function(){
                $scope.notification["list"] = data["list"]
                $scope.notification["count"] = data["count"]
                $scope.notification["read"] = data["read"]
            })
            /*$scope.notification = {}
            $scope.notification["list"] = data["list"]
            $scope.notification["count"] = data["count"]*/
            $scope.clientId = data.clientId
            console.log(":$scope.notification",$scope.notification)
        } else {
            console.log("There is a problem:", data);
        }
        
    });
    console.log(":$scope.user_name",$scope.user_name)
    socket.emit('info',{"user_info":$scope.user_info})
    socket.on('newmessage',function(data){
        if(data.message) {
            messages.push(data.notification.name +": "+data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
            $scope.$apply(function() {
            //$scope.globalVar.turnNumber = data.number;
            //$scope.globalVar.currentPlayer = data.currentPlayer;
            //$scope.count = data.count
            //$scope.notification["list"].splice(0, 0, data.notification);
            //$scope.notification["count"] += 1 
            $scope.messageObj["count"] += 1
            $scope.messageObj["list"].splice(0, 0, data.notification);
            //$scope.notification["read"] = data.read
        });
        } else {
            console.log("There is a problem:", data);
        }
    })
    socket.on('notification',function(data){
            console.log(":notification",data)
            $scope.$apply(function() {
            //$scope.globalVar.turnNumber = data.number;
            //$scope.globalVar.currentPlayer = data.currentPlayer;
            $scope.count = data.count
            for(a in data.list){
                $scope.notification["list"].splice(0, 0, data.list[a]);
            }
            $scope.notification["count"] = data.count
            $scope.notification["read"] = data.read
        });
        
    })
    socket.on('newuser',function(data){
        console.log(":newuser",data);
    })
    socket.on('msg',function(data){
        console.log("data.message",data.message,"data.count",data.count)
        //$scope.notification["list"] = data["list"]
        $scope.$apply(function() {
            //$scope.globalVar.turnNumber = data.number;
            //$scope.globalVar.currentPlayer = data.currentPlayer;
            $scope.count = data.count
            $scope.notification["list"].splice(0, 0, data.notification);
            $scope.notification["count"] = data.count
            $scope.notification["read"] = data.read
        });
        //$scope.count = data.count
        console.log(":$scope.count",$scope.count)
    })
    socket.on('disconnect',function(data){
        console.log("disconnect",data)
    })

    socket.on('socket-list',function(activeSocketsObj){
        console.log(":socketlist")
        console.log(":data",activeSocketsObj)
        //var index = data.indexOf($scope.user_info)
        //console.log(":index",index)
        delete activeSocketsObj[$scope.user_info.user_id]
        $scope.$apply(function(){
            $scope.activeSockets = activeSocketsObj
        })
    })

    //Invoked when some user wants to personal chat with you
    //sourceUserDetail is the details of the user who want to private chat
    socket.on('private-chat-proposal',function(sourceUserDetail){
        console.log(":private chat proposal",sourceUserDetail)
        var proposalObj = {"sourceUserDetail":sourceUserDetail}
        proposalObj["message"] = sourceUserDetail["user_name"] + " wants Private chat with you"
        $scope.chatProposals.unshift(proposalObj)
    })

    //Invoke when a desination user replies for your private chat proposal
    //responseObj is a JSON Object contains destination user acceptance and destination user details
    socket.on('private-chat-proposal-destination-response',function(responseObj){
        responseObj["acceptance"]
        responseObj["destinationUserInfo"]
        //console.log(":your chat proposal response",responseObj["acceptance"])
        if(responseObj["acceptance"]){
            //startPrivateChatSession(responseObj["destinationUserInfo"]);
            console.log("Your Request to Private Chat is Accepted....Initiating Private Chat Session")
        }else{
            console.log("Your Request to Private Chat is Denied by Destination User")
        }
    })

    //When It accepts proposal This Invokes Private Chat Session
    socket.on('private-chat-session-start',function(destinationUserInfo){
        //console.log(":your chat proposal response",responseObj["acceptance"])
            startPrivateChatSession(destinationUserInfo);
    })

    //This is invoked when message received in private chat
    socket.on('private-chat-session',function(receivedMessage){
        var message = receivedMessage["message"]
        if(receivedMessage.sourceUserId.user_id == $scope.privateChatSession["destinationUserDetails"].user_id){
            console.log(":you received message ",message)
            appendMessageInPrivateChat($scope.privateChatSession["destinationUserDetails"].user_name,message)
        }
    })

    //This is invoked when The user whose private chat request you accepted is disconnected
    socket.on('private-chat-session-source-missing',function(sourceUserDetail){
        console.log(":Source You want to Private chat with is Disconnected")
        console.log(":sourceUserDetail",sourceUserDetail)
    })

    //This is invoked when the user you are chatting with disconnectes or close the Private Chat
    //reasonCode = 0 means user Disconnected
    //reasonCode = 1 means user Closes the Private Chat Session
    socket.on('private-chat-session-over',function(reasonCode){
        if(reasonCode.code == 0){
            console.log(":destination user disconnected")
            terminatePrivateChatSession()
        }else if(reasonCode.code == 1){
            console.log(":destination user Closes it's Private Chat Session")
            terminatePrivateChatSession()
        }
    })
    //Invoke when a Destination user accepts the request for a Private chat Session
    //destinationUserDetails is a JSON Object which contains information about destination user
    var startPrivateChatSession = function(destinationUserInfo){
        console.log(":destinationUserInfo",destinationUserInfo)
        $scope.privateChatSession["enable"] = true
        $scope.privateChatSession["destinationUserDetails"] = destinationUserInfo
    }

    //This is called to Terminate present Private Chat Session
    var terminatePrivateChatSession = function(){
        angular.element('#private_chat_content').empty()
        $scope.privateChatSession = {"enable":false,"destinationUserDetails":{},input:""}
    }
    //Invoke when someone clicks on submit on private chat session
    $scope.privateChatSessionSubmit = function(){
        console.log(":submit called")
        if($scope.privateChatSession.input == "")
            return
        var messageObj = {"user_id":$scope.privateChatSession["destinationUserDetails"]["user_id"],
                          "message":$scope.privateChatSession.input}
        socket.emit('private-chat-session',messageObj)
        appendMessageInPrivateChat("Me",$scope.privateChatSession.input)
        console.log(":privateChatSession.input",$scope.privateChatSession.input)
        $scope.privateChatSession.input = ""
    }

    sendButton.onclick = function() {
        //console.log(":called");
        var text = field.value;
        field.value = ""
        console.log(":socket clientid",socket.clientId)
        socket.emit('send', { message: text });
        messages.push("me" +": "+text);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
        content.innerHTML = html;

    };

    $scope.updateReadNotificationCount = function(){
        $scope.showList = true
        //console.log(":called")
        console.log(":called updateReadNotification")
        $http.post('/update/all', {"clientId":$scope.clientId})
        .success(function(data) {
            //$scope.form1 = {};
            //$scope.$parent.email=data;
            //$cookieStore.put('name',data.name);
            $scope.notification["read"] = data.read
            console.log("data back ::",data);
            //alert("submit1");
            //$state.go('state3');
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    }

    $scope.closeNotificationList = function(){
        console.log(":called closeNotification")
        $scope.showList = false
    }

    //Invoked when user clicks on any active client list for private chat
    //obj is JSON contains destination user details
    $scope.startPrivateChat = function(obj){
        //console.log("start chat with obj",obj)
        //This Condition will be true when you try to start a private chat session with a Busy user
        if(obj["status"] == 'Busy'){
            console.log("You're Requesting for a Private Chat Session with a user who is already involved in a Private Chat.This Action is not allowed")
            return
        }
        socket.emit('private-chat-request',obj)
    }

    //Invokes when user respond the private chat proposal
    //SourceUserDetail is Object which contains information of source User
    //destinationUserResponse is BOOLEAN contains response of destination user
    $scope.privateChatResponse = function(sourceUserDetail,destinationUserResponse){
        //console.log(":privateChatResponse")
        /*This Condition is true when You have a active Private Chat Session and You Accepts another
        Private Chat Session Request before closing the previous one. So system will not allow you*/ 
        if(destinationUserResponse && $scope.privateChatSession["enable"]){
            console.log("You have a active Private Chat Session. You can't proceed with more than one Private Chat Sessions at a time")
            return
        }
        console.log(":after if")
        var responceObj = {"Accepted":destinationUserResponse}
        responceObj["sourceUserDetail"] = sourceUserDetail["sourceUserDetail"]
        for (i in $scope.chatProposals){
            if ($scope.chatProposals[i]["sourceUserDetail"].user_id == responceObj["sourceUserDetail"].user_id){
                $scope.chatProposals.splice(i,1)
                break;
            }
        }
        socket.emit('private-chat-proposal-response',responceObj)
    }

    //This is Called When a user closes it's Private Chat Session
    $scope.closePrivateChat = function(){
        var destinationUserDetails = $scope.privateChatSession["destinationUserDetails"]
        socket.emit('close-current-private-chat-session',destinationUserDetails)
        terminatePrivateChatSession()
    }

    var appendMessageInPrivateChat = function(userName,message){
        var elm = angular.element("#private_chat_content")
        var template = "<span>"+userName[0].toUpperCase() +userName.substring(1,userName.length) + " : "+message+"</span><br />"
        var elToAppend = $compile(template)($scope);
        elm.append(elToAppend);
    }

})

sampleApp.directive("outsideClick", ['$document','$parse', function( $document, $parse ){
    return {
        link: function( $scope, $element, $attributes ){
            var scopeExpression = $attributes.outsideClick,
                onDocumentClick = function(event){
                    var isChild = $element[0].contains(event.target);

                    if(!isChild) {
                        $scope.$apply(scopeExpression);
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        }
    }
}]);


sampleApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
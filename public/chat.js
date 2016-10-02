//angular.app("sampleApp").controller("sampleController")
var sampleApp = angular.module('sampleapp',  ['angular-notification-icons','angular-click-outside','ui.router','ngCookies','LocalStorageModule'])

sampleApp.config(function($stateProvider, $urlRouterProvider) {
    //
  // For any unmatched url, redirect to /login
    /*$urlRouterProvider.otherwise(function($injector, $location){
        var $state = $injector.get('$state');
        var path = window.location.hash.split('/')[1];
        console.log("statet path",path);
        var logInStatusObj = window.localStorage.loggedIn
        console.log(":state type(logInStatusObj)",typeof logInStatusObj)
        console.log(":JSON.parse state",JSON.parse(logInStatusObj))
    });*/

           /*if(window.localStorage.loggedIn == "true"){
              if(path!=''&& path!=undefined)
                {
                  $state.go(path);
                }
              else
                {
             $state.go('dashboard');
                }
           }
          else{
            
          }*/
   
  
  $urlRouterProvider.otherwise("/home");
  //
  // Now set up the states 

  $stateProvider
    .state('home', {
      url: "/home",
      params:{
        "user_name": null
      },
      templateUrl: "templates/home.html",
      controller: 'samplecontroller'
    })
    /*.state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'logincontroller',
      params:{
        "redirectMessage":null
      },
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                permission: function () {
                    console.log(":login resolve calles")
                    return false
                }
        }
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "templates/signup.html",
      controller: 'signupController'
    })*/
});







sampleApp.run(['$state', '$rootScope','$timeout','$injector', function($state, $rootScope, $timeout, $injector) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

        console.log(":change State")
        console.log(":toState",toState)
        console.log(":fromState",fromState)
        console.log(":toParams",toParams)
        console.log(":fromParams",fromParams)
        if(toState.name == "home"){
            console.log(":perform authentication here")
        }
        /*$timeout(function () {
                    $state = $injector.get('$state');
                });
        if(fromState.name == "PageTab.Page3" && (!toParams.stateChangeAction)){
            console.log(":prevented State")
            e.preventDefault()
            return $state.go('PageTab.Page1',{"stateChangeAction":true})
        }*/
    });
}]);

sampleApp.controller('mainCtrl',function($scope, $http,localStorageService){
    localStorageService.set("key","swswswsws")
    console.log(":localStorageService",localStorageService.get("key"))

})
sampleApp.controller('logincontroller',function($scope,$http,$state,$cookieStore,$stateParams){
    console.log(":In login controller")
    $scope.message =  "login";
    $scope.errorMessage = ""
    $scope.redirectMessage = ""
    if($cookieStore.get('user_info') != undefined){
        return $state.go('home')
    }
    $scope.user = {user:'',password:''}
    $cookieStore.put('user_info',undefined)
    var logInStatusObj = {"loggedIn":false}
    window.localStorage.loggedIn=JSON.stringify(logInStatusObj)
    if ($stateParams.redirectMessage != null){
        $scope.redirectMessage = $stateParams.redirectMessage
    }

    $scope.submit=function()
      {
        if($scope.user.user == '' || $scope.user.password ==''){
            $scope.errorMessage = 'User Name or Password can\'t be empty'
            return
        }
        $http.post('/login', $scope.user)
        .success(function(data) {
            console.log(":data",data)
            if(data.statusCode ==1){
                if(data.loggedIn){
                    var user_info = data.userDetail
                    $cookieStore.put('user_info',user_info)
                    logInStatusObj["loggedIn"] = true
                    logInStatusObj["user_info"] = user_info
                    window.localStorage.loggedIn = JSON.stringify(logInStatusObj)
                    //$state.go('home',{"user_name":$scope.user.name});
                    window.location.href = '/'

                }else{
                    $scope.errorMessage = data.Message
                }
            }else{
                console.log(":Internal Server Error")
                $scope.errorMessage = "Internal Server Error. Please try after some time"
            }
        })
        .error(function(error) {
          //$state.go('login');
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
        $state.go('login',{"user_name":$scope.user.user});*/
  }

  $scope.redirectToSignUp = function(){
    $state.go('signup')
  }
      
});




sampleApp.controller('samplecontroller',function($scope, $http,$state,$cookieStore,$compile){
//window.onload = function() {
    console.log(":called")
    console.log(":$state.params.user_name",$state.params.user_name)
    var logInStatusObj = window.localStorage.loggedIn
    console.log(":type(logInStatusObj)",typeof logInStatusObj)
    console.log(":JSON.parse",JSON.parse(logInStatusObj))
    if($cookieStore.get('user_info') == undefined){
        return $state.go('login',{redirectMessage:'Please login before continue'})
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
            if(data.statusCode == 0){
                console.log("Error Updating Information, Please try again later")
                return
            }
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
            console.log("Error Updating Information, Please try again later")
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



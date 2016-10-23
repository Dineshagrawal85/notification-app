var chatApp = angular.module('chatApp',  ['angular-notification-icons','angular-click-outside','ui.router','ngCookies','LocalStorageModule','toaster','ngAnimate'])

chatApp.config(function($stateProvider, $urlRouterProvider) {
     
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
      controller: 'chatController'
    })

});


chatApp.controller('parentController',function($scope, $http,localStorageService){
   /* localStorageService.set("key","swswswsws")
    console.log(":localStorageService",localStorageService.get("key"))*/

})

chatApp.controller('chatController',function($scope, $http,$state,$cookieStore,$compile,toaster,_){
//window.onload = function() {
    var logInStatusObj = window.localStorage.loggedIn
    var userInfoObject = JSON.parse(logInStatusObj)
    if(userInfoObject['user_info'] == undefined || !userInfoObject['loggedIn']){
        return $state.go('login',{redirectMessage:'Please login before continue'})
    }
    /*if($cookieStore.get('user_info') == undefined){
        return $state.go('login',{redirectMessage:'Please login before continue'})
    }*/
    //$scope.user_info = $cookieStore.get("user_info")
    $scope.user_info = userInfoObject['user_info']
    var messages = [];
    var socket = io.connect('/');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("public_chat_send");
    var content = document.getElementById("content");
    $scope.clientId = ""
    $scope.count = 10
    $scope.notification = {}
    $scope.messageObj = {count:0,
        list:[]}
    $scope.activeSockets = []
    $scope.activeSocketCount = 0
    $scope.showList = false
    $scope.chatProposals = []
    $scope.privateChatSession = {"enable":false}
    $scope.publicMessageArray = []
    $scope.privateMessageArray =  []
   /* setTimeout(function(){
        $scope.count = 20
    },10000)*/

    socket.on('message', function (data) {
        if(data.message) {
            /*messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }*/
            //content.innerHTML = html;
            var messageObj = {}
            messageObj["created_by"] = 'System';
            messageObj["messsage"] = data.message
            messageObj["img_url"] = 'chat-logo.jpg'
            $scope.publicMessageArray.push(messageObj)
            $scope.$apply(function(){
                $scope.notification["list"] = data["list"]
                $scope.notification["count"] = data["count"]
                $scope.notification["read"] = data["read"]
            })
            /*$scope.notification = {}
            $scope.notification["list"] = data["list"]
            $scope.notification["count"] = data["count"]*/
            $scope.clientId = data.clientId
            $('.box-body').scrollTop($('#public_chat').height()+50)
        } else {
            console.log("There is a problem:", data);
        }
        
    });
    socket.emit('info',{"user_info":$scope.user_info})
    socket.on('newmessage',function(data){
        if(data.message) {
            /*messages.push(data.notification.name +": "+data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;*/
            var messageDetailObj = {}
            messageDetailObj["created_by"] = data.notification.name;
            messageDetailObj["messsage"] = data.message
            try{
                messageDetailObj["img_url"] = $scope.activeSockets[data.notification.id].img_url
            }
            catch(e){
                messageDetailObj["img_url"] = ""
            }
            $scope.publicMessageArray.push(messageDetailObj)
            $scope.$apply(function() {
            //$scope.globalVar.turnNumber = data.number;
            //$scope.globalVar.currentPlayer = data.currentPlayer;
            //$scope.count = data.count
            //$scope.notification["list"].splice(0, 0, data.notification);
            //$scope.notification["count"] += 1 
            $scope.messageObj["count"] += 1
            $scope.messageObj["list"].splice(0, 0, data.notification);
            setTimeout(function(){
                $('.box-body').scrollTop($('#public_chat').height()+50)
            },200)
            //$scope.notification["read"] = data.read
        });
        } else {
            console.log("There is a problem:", data);
        }
    })
    socket.on('notification',function(data){
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
    })
    socket.on('disconnect',function(data){
        console.log("disconnect",data)
    })

    socket.on('socket-list',function(activeSocketsObj){
        //var index = data.indexOf($scope.user_info)
        //console.log(":index",index)
        delete activeSocketsObj[$scope.user_info.user_id]
        $scope.$apply(function(){
            $scope.activeSockets = activeSocketsObj
            $scope.activeSocketCount = Object.keys(activeSocketsObj).length
        })
    })

    //Invoked when some user wants to personal chat with you
    //sourceUserDetail is the details of the user who want to private chat
    socket.on('private-chat-proposal',function(sourceUserDetail){
        var proposalObj = {"sourceUserDetail":sourceUserDetail}
        proposalObj["message"] = sourceUserDetail["user_name"] + " wants Private chat with you"
        //This condition will be true when you do more that one request to the same person
        for(i in $scope.chatProposals){
            if($scope.chatProposals[i]['sourceUserDetail']["user_id"] == sourceUserDetail["user_id"]){
                return
            }
        }
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
            toaster.pop('success', "Private Chat Notification", "Your Request to Private Chat with " +responseObj["destinationUserInfo"].user_name +" is Accepted....Initiating Private Chat Session");
        }else{
            toaster.pop('error', "Private Chat Notification", "Your Request to Private Chat with " +responseObj["destinationUserInfo"].user_name +" is Rejected.");
        }
    })

    //When It accepts proposal This Invokes Private Chat Session
    socket.on('private-chat-session-start',function(destinationUserInfo){
        //console.log(":your chat proposal response",responseObj["acceptance"])
        //$(".private-chat-window").removeClass("chat-hide");
            startPrivateChatSession(destinationUserInfo);
    })

    //This is invoked when message received in private chat
    socket.on('private-chat-session',function(receivedMessage){
        var message = receivedMessage["message"]
        if(receivedMessage.sourceUserId.user_id == $scope.privateChatSession["destinationUserDetails"].user_id){
             /*var messageObj = {}
        messageObj["created_by"] = $scope.privateChatSession["destinationUserDetails"].user_name;
        messageObj["img_url"] = $scope.privateChatSession["destinationUserDetails"]["img_url"]
        messageObj["messsage"] = message*/

        //$scope.privateMessageArray.push(messageObj)
            appendMessageInPrivateChat($scope.privateChatSession["destinationUserDetails"].user_name,message,$scope.privateChatSession["destinationUserDetails"]["img_url"])
        }
    })

    //This is invoked when The user whose private chat request you accepted is disconnected
    socket.on('private-chat-session-source-missing',function(sourceUserDetail){
        toaster.pop('error', "Private Chat Notification", " " +sourceUserDetail.user_name +",is disconnected");
    })

    //This is invoked when the user you are chatting with disconnectes or close the Private Chat
    //reasonCode = 0 means user Disconnected
    //reasonCode = 1 means user Closes the Private Chat Session
    socket.on('private-chat-session-over',function(reasonCode){
        if(reasonCode.code == 0){
            toaster.pop('error', "Private Chat Notification", "Closing Private Chat Session, "+$scope.privateChatSession.destinationUserDetails.user_name+" is disconnected.",10000);
            terminatePrivateChatSession()
        }else if(reasonCode.code == 1){
            toaster.pop('error', "Private Chat Notification", "Closing Private Chat Session, "+$scope.privateChatSession.destinationUserDetails.user_name+" closed Private Chat Session with you.",10000);
            terminatePrivateChatSession()
        }
    })

    //Invoke when a Destination user accepts the request for a Private chat Session
    //destinationUserDetails is a JSON Object which contains information about destination user
    var startPrivateChatSession = function(destinationUserInfo){
        $scope.privateChatSession["enable"] = true
        $scope.privateChatSession["destinationUserDetails"] = destinationUserInfo
    }

    //This is called to Terminate present Private Chat Session
    var terminatePrivateChatSession = function(){
        //angular.element('#private_chat_content').empty()
        $scope.privateMessageArray = []
        $scope.privateChatSession = {"enable":false,"destinationUserDetails":{},input:""}
    }

    /*//Invoke when someone clicks on submit on private chat session
    $scope.privateChatSessionSubmit = function(){
        console.log(":submit called")
        if($scope.privateChatSession.input == "")
            return
        var messageObj = {"user_id":$scope.privateChatSession["destinationUserDetails"]["user_id"],
                          "message":$scope.privateChatSession.input}
        socket.emit('private-chat-session',messageObj)
        appendMessageInPrivateChat("Me",$scope.privateChatSession.input,$scope.user_info["img_url"])
        console.log(":privateChatSession.input",$scope.privateChatSession.input)
        $scope.privateChatSession.input = ""
    }*/

    var sensMsgInPublicChat = sendButton.onclick = function() {
        if($scope.public_chat_message == "")
            return
        //console.log(":called");
        var text = $scope.public_chat_message //field.value;
        $scope.public_chat_message = ""
        //field.value = ""
        socket.emit('send', { message: text });
        var messageObj = {}
        messageObj["created_by"] = 'Me';
        messageObj["messsage"] = text
        messageObj["img_url"] = $scope.user_info["img_url"]
        $scope.publicMessageArray.push(messageObj)
        setTimeout(function(){
            $('.box-body').scrollTop($('#public_chat').height()+50)
        },200)
        /*messages.push("me" +": "+text);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
        content.innerHTML = html;*/

    };

    $scope.sendMessageInPublicChat = function(event){
        if(event.which == 13){
            sensMsgInPublicChat()
        }
    }

    var privateChatSendButton = document.getElementById("btn-chat");
    //Invoke when someone clicks on submit on private chat session
    var sendMessageInPrivateChat = privateChatSendButton.onclick = function(){
        if ($scope.private_chat_message == "")
            return
        var text = $scope.private_chat_message
        $scope.private_chat_message = ""
        /*var messageObj = {}
        messageObj["created_by"] = 'Me';
        messageObj["img_url"] = $scope.user_info["img_url"]
        messageObj["messsage"] = text*/

        var messageObjToSend = {"user_id":$scope.privateChatSession["destinationUserDetails"]["user_id"],
                          "message":text}
        socket.emit('private-chat-session',messageObjToSend)
        //$scope.privateMessageArray.push(messageObj)




         //Invoke when someone clicks on submit on private chat session
    //$scope.privateChatSessionSubmit = function(){
        
        
        appendMessageInPrivateChat("Me",text, $scope.user_info["img_url"])

    }


    $scope.sendMessageInPrivateChat = function(event){
        if(event.which == 13){
            //sensMsgInPublicChat()
            sendMessageInPrivateChat()
        }
    }

    //This function is called to mark all the messages as read
    $scope.updateReadNotificationCount = function(){
        $scope.showList = true
        //console.log(":called")
        $scope.previouslyRead = $scope.notification.count-$scope.notification.read
        $http.post('/update/all', {"clientId":$scope.clientId})
        .success(function(data) {
            if(data.statusCode == 0){
                //console.log("Error Updating Information, Please try again later")
                toaster.pop('error', "Error Updating Information, Please try again later");
                return
            }
            //$scope.form1 = {};
            //$scope.$parent.email=data;
            //$cookieStore.put('name',data.name);
            $scope.notification["read"] = data.read
            //alert("submit1");
            //$state.go('state3');
        })
        .error(function(error) {
            if(error.statusCode == 401){
                window.location.href = '/'
            }
        });
    }

    $scope.closeNotificationList = function(){
        $scope.showList = false
    }

    //Invoked when user clicks on any active client list for private chat
    //obj is JSON contains destination user details
    $scope.startPrivateChat = function(obj){
        //console.log("start chat with obj",obj)
        //This Condition will be true when you try to start a private chat session with a Busy user
        if(obj["status"] == 'Busy'){
            toaster.pop('error', "You're Requesting for a Private Chat Session with a user who is already involved in a Private Chat.This Action is not allowed.");
            return
        }

        if($scope.privateChatSession.enable){
            toaster.pop('error', "You're already involved in a Private Chat.This Action is not allowed.");
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
            toaster.pop('error', "You have an active Private Chat Session. You can't proceed with more than one Private Chat Sessions at a time");
            return
        }
        if(destinationUserResponse){
            if ($scope.activeSockets[sourceUserDetail["sourceUserDetail"].user_id] == undefined || $scope.activeSockets[sourceUserDetail["sourceUserDetail"].user_id].status == 'Busy'){
                if ($scope.activeSockets[sourceUserDetail["sourceUserDetail"].user_id] == undefined){
                    toaster.pop('error', sourceUserDetail["sourceUserDetail"].user_name + " is offline. Can't initiate Private Chat Session.");
                }else{
                    toaster.pop('error', sourceUserDetail["sourceUserDetail"].user_name + " is Busy. Can't initiate Private Chat Session.");
                }
                    
                var index;
                _.find($scope.chatProposals, function (user,indexVal) {
                    if(user["sourceUserDetail"].user_id == sourceUserDetail["sourceUserDetail"].user_id){ index =  indexVal; return true}
                });
                index = (index != undefined)?$scope.chatProposals.splice(index,1):index;
                return
            }
        }
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

    var appendMessageInPrivateChat = function(userName,message,imgUrl){
        /*var elm = angular.element("#private_chat_content")
        var template = "<span>"+userName[0].toUpperCase() +userName.substring(1,userName.length) + " : "+message+"</span><br />"
        var elToAppend = $compile(template)($scope);
        elm.append(elToAppend);*/

        var messageObj = {}
        messageObj["created_by"] = userName;
        messageObj["img_url"] = imgUrl
        messageObj["messsage"] = message
        $scope.privateMessageArray.push(messageObj)
        setTimeout(function(){
            $('.msg_container_base').scrollTop($('.msg_container_base').scrollTop()+500)
        },200)
    }

    //This is invoked to logout the user
    $scope.logOutUser = function(){
        $http.get('/logout', $scope.user)
        .success(function(data) {
            if(data.statusCode == 1){
                window.location.href =  '/'
            }else{
                toaster.pop('error', "Internal Server Error Please try again later");
            }
        })
        .error(function(error) {
            window.location.href =  '/'
        });
    }




    jQuery('.box .tools .collapse,.box  .tools .expand').click(function () {
    
            var el = jQuery(this).parents(".box").children(".box-body");
      
            if (jQuery(this).hasClass("collapse")) {
      
        jQuery(this).removeClass("collapse").addClass("expand");
                var i = jQuery(this).children(".fa-chevron-up");
        i.removeClass("fa-chevron-up").addClass("fa-chevron-down");
                el.slideUp(200);
            } else {
        jQuery(this).removeClass("expand").addClass("collapse");
                var i = jQuery(this).children(".fa-chevron-down");
        i.removeClass("fa-chevron-down").addClass("fa-chevron-up");
                el.slideDown(200);
            }
        });
    
    /* Close */
    jQuery('.tools a.remove').click(function () {
            var removable = jQuery(this).parents(".box");
            if (removable.next().hasClass('box') || removable.prev().hasClass('box')) {
                jQuery(this).parents(".box").remove();
            } else {
                jQuery(this).parents(".box").parent().remove();
            }
        });
    
    
        

$(document).on('click', '.panel-heading span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});


})

chatApp.directive("outsideClick", ['$document','$parse', function( $document, $parse ){
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


chatApp.factory('_', function() {
        return window._; // assumes underscore has already been loaded on the page
}); 
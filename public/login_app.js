var loginApp = angular.module('loginApp',['LocalStorageModule','ui.router','ngCookies','toaster','ngAnimate'])

loginApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
  //
  // Now set up the states 

  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'logincontroller',
      params:{
        "redirectMessage":null
      }
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "templates/signup.html",
      controller: 'signupController'
    })
})


loginApp.controller('logincontroller',function($scope,$http,$cookieStore,$state,$stateParams,toaster){
    $scope.message =  "login";
    $scope.errorMessage = ""
    $scope.redirectMessage = ""
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
            if(data.statusCode ==1){
                if(data.loggedIn){
                    var user_info = data.userDetail
                    $cookieStore.put('user_info',user_info)
                    logInStatusObj["loggedIn"] = true
                    logInStatusObj["user_info"] = user_info
                    window.localStorage.loggedIn = JSON.stringify(logInStatusObj)
                    window.location.href = '/'

                }else{
                    $scope.errorMessage = data.Message
                    toaster.pop('error', $scope.errorMessage);
                }
            }else{
                //console.log(":Internal Server Error")
                $scope.errorMessage = "Internal Server Error. Please try after some time"
                toaster.pop('error', $scope.errorMessage);
            }
        })
        .error(function(error) {
            $scope.errorMessage = "Internal Server Error. Please try after some time"
            toaster.pop('error', $scope.errorMessage);
        });
  }

  $scope.redirectToSignUp = function(){
    $state.go('signup')
  }
      
});




loginApp.controller('signupController',function($scope, $http,localStorageService,$state){
    $scope.errorMessage = ""
    $scope.user = {"username":'',"password":""}
    $scope.registerUser = function(){
        if($scope.user.username == ''){
            $scope.errorMessage = "User Name cannot be left empty"
            return
        }
        if($scope.user.password == ''){
            $scope.errorMessage = "Password cannot be left empty"
            return
        }

        if($scope.myfile == undefined){
            $scope.errorMessage = "Please upload an image"
            return
        }
        var fd = new FormData();

        fd.append('file', $scope.myfile);
        fd.append("user",$scope.user.username)
        fd.append("password",$scope.user.password)
        $http.post('signup', fd ,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
            if(data.statusCode == 1){
                return $state.go('login',{redirectMessage:'SignUp Success. Please continue with login'})
            }
            $scope.errorMessage = "SignUp fail please try after some time"
        })

        .error(function(err){
            $scope.errorMessage = "SignUp fail please try after some time"
        });
    }
})


loginApp.directive('fileModel', ['$parse', function ($parse) {
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
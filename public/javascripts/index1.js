var sampleApp = angular.module('sampleApp', ['ui.router','ngCookies']);

sampleApp.controller('aaa',function($scope){
  $scope.show1=true;
  
  
});

sampleApp.run(function($rootScope) {
    $rootScope.test = true;
});
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

sampleApp.controller('signupcontroller',function($scope,$http,$state,$rootScope,$cookieStore){
  $scope.message =  "Sign Up";
          $rootScope.test=true;
          $scope.$parent.show1 = true;
          /*$scope.$watch('usernumber',function() {
         
         if($scope.usernumber.length<=10)
         {
        $scope.usernumber = $scope.usernumber.toLowerCase().replace(/[^0-9]/g, '');
        $scope.val=$scope.usernumber;
}
        else
        {
        $scope.usernumber= $scope.val;
        }
  });*/
        $scope.update=function()
  {
    //alert("submit_");
    //$user.number=$usernumber;
    var data={email:$scope.user.email, password:$scope.user.password, name:$scope.user.name, number:$scope.usernumber};
    console.log(data);
    $http.post('/signup', data)
        .success(function(data) {
            $scope.form1 = {};
            //$scope.$parent.email=data;
            $cookieStore.put('name',data.name);
            console.log("data back ::"+data);
            //alert("submit1");
            $state.go('state3');
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        //alert("submit--");
  }  
});
sampleApp.controller('logincontroller',function($scope,$http,$state,$rootScope,$cookieStore,$cookies){
  
          $scope.message =  "login";
          $cookieStore.put('namecookie','dkjjnd');
          console.log(" : "+$cookieStore.get('namecookie'));
          /*var someSessionObj = { 'innerObj' : 'somesessioncookievalue'};

    $cookies.dotobject = someSessionObj;
    $scope.usingCookies = { 'cookies.dotobject' : $cookies.dotobject, "cookieStore.get" : $cookieStore.get('dotobject') };
    console.log(" : "+$cookies.dotobject);
    $cookieStore.put('obj', someSessionObj);
    $scope.usingCookieStore = { "cookieStore.get" : $cookieStore.get('obj'), 'cookies.dotobject' : $cookies.obj, };*/
          $scope.$parent.show1 = true;
          $rootScope.test=true;
          $scope.submit=function()
  {
//console.log("form1w " + $scope.user + " :::: "+$scope.user.name+ " :::: "+$scope.user.password)
      //alert("submit_");
    $http.post('/submitform', $scope.user)
        .success(function(data) {
            $scope.form1 = {};
            console.log(data);
            $scope.$parent.email = data;
            //alert("submit1");
            $state.go('state3');
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
        //alert("submit--");
  }
      
});
sampleApp.controller('dashboardcontroller',function($scope,$http,$state,$rootScope,$cookieStore){
$scope.message =  "dashboard Hello "+$cookieStore.get('name');
$rootScope.test=false;
  $scope.$parent.show1=false;
$scope.tagimg=false;
/*var user= {email:$scope.$parent.email};
$http.post('/api/getdata', user, {


}) .success(function(data){})
.error(function(){});
*/
//console.log(": cookie :"+$cookieStore.get('email'));
//console.log(": "+$scope.$parent.email + ":" );

$scope.uploadphoto = function() {

  //console.log("function called");
//console.log($scope.name1);
 var fd = new FormData();
        var fd = new FormData();
        fd.append('file', $scope.myfile);
        //console.log(fd);
        $http.post('/api/photo', fd ,{
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
          console.log("Success call");
          $scope.message="Uploaded successfully" +">>>>>>>>>" + data;
          $scope.tagimg=true;
          document.getElementById("img1").src="/images/"+data;
        })
        .error(function(){
        });
 
};



      });
sampleApp.config(function($stateProvider, $urlRouterProvider) {
    //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");
  //
  // Now set up the states 

  $stateProvider
    .state('state1', {
      url: "/home",
      templateUrl: "views/templates/home.html",
      controller: function($scope,$rootScope) {
      	  $scope.message =  "home";
          $rootScope.test=false;
          $scope.$parent.show1=false;
          console.log(": "+$scope.$parent.email+" :");
      }
    })
    
    .state('state2', {
      url: "/about",
      templateUrl: "views/templates/about.html",
      controller: function($scope,$rootScope) {
      	  $scope.message =  "about";
          $rootScope.test=false;
          $scope.$parent.show1=false;
          console.log(": "+$scope.$parent.email+" :");
      }
    })
    .state('state3', {
      url: "/dashboard",
      templateUrl: "views/templates/dashboard.html",
      controller: 'dashboardcontroller'
          
    })
    .state('state4', {
      url: "/login",
      templateUrl: "views/templates/login.html",
      controller: 'logincontroller'
    })
    .state('state5', {
      url: "/signup",
      templateUrl: "views/templates/signup.html",
      controller: 'signupcontroller'
    })
    /*.state('state2.list', {
      url: "/list",
      templateUrl: "partials/state2.list.html",
      controller: function($scope) {
        $scope.things = ["A", "Set", "Of", "Things"];
      }
    });*/
});
app = angular.module('nodeTodo', []);

app.controller('mainController', function($scope, $http) {

    $scope.formData = {}; 
    $scope.todoData = {};
    console.log("<<<<<<<<<<<<<<<<<<<-------------------");
    // Get all todos
    $http.get('/api/v1/items').success(function(data) {
        $scope.todoData = data;
        console.log(data);
    }).error(function(error) {
        console.log('Error: ' + error);
    });

    $scope.deleteTodo = function(todoID) {
        console.log("-----------------------------------------------");
        $http.delete('/api/v1/items/' + todoID)
            .success(function(data) {
                $scope.todoData = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    $scope.createTodo = function() {
    $http.post('/api/v1/items', $scope.formData)
        .success(function(data) {
            $scope.formData = {};
            $scope.todoData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    };
});
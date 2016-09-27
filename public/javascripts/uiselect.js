var app = angular.module('formlyExample', ['ngSanitize', 'formly', 'formlyBootstrap', 'ui.select'], function config(formlyConfigProvider) {
    // set templates here
  formlyConfigProvider.setType({
            name: 'ui-select-multiple',
            extends: 'select',
            templateUrl: 'ui-select-multiple.html'
        });
});



app.controller('MainCtrl', ["$scope", function ($scope) {
    $scope.constants = {
        regions: [
            {
                value: "National",
                key: "National"
            },
            {
                value: "North",
                key: "North"
            },
            {
                value: "East",
                key: "East"
            },
            {
                value: "West",
                key: "West"
            },
            {
                value: "South",
                key: "South"
            }
        ],
        content_type: [
            {
                value: "Archive",
                key: "Archive"
            },
            {
                value: "General Papers",
                key: "General Papers"
            },
            {
                value: "News",
                key: "News"
            },
            {
                value: "Technical papers",
                key: "Technical papers"
            },
            {
                value: "data",
                key: "data"
            }
        ],
        subscription_packages: [
            {
                id: 1,
                name: "Locally"
            },
            {
                id: 2,
                name: "Plus"
            },
            {
                id: 3,
                name: "Results"
            },
            {
                id: 4,
                name: "Support"
            },
            {
                id: 5,
                name: "Premium"
            },
            {
                id: 6,
                name: "Ninja"
            },
            {
                id: 7,
                name: "Specialist"
            },
            {
                id: 8,
                name: "Beginner"
            },
            {
                id: 9,
                name: "Rookie"
            }
        ]
    };
    var multiSelectDropDown = function (key, label, data, valueProp, labelProp, required) {
        return [
            {
                key: key,
                type: 'ui-select-multiple',
                templateOptions: {
                    optionsAttr: 'bs-options',
                    ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
                    valueProp: valueProp,
                    labelProp: labelProp,
                    label: label,
                    placeholder: label,
                    options: data,
                    required: required
                }
            }
        ];
    };

  $scope.multiSubscriptionPackage = multiSelectDropDown("subscription_package", "Subscription Package", $scope.constants.subscription_packages, "id", "name", true);
    
  $scope.multiContentType = multiSelectDropDown("content_type", "Content Type", $scope.constants.content_type, "value", "key", true);
   
  
  $scope.multiRegion = multiSelectDropDown("region", "Region", $scope.constants.regions, "key", "value", false);
   


}]);
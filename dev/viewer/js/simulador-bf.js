           
	    var app = angular.module("SalesSimManager", []);  

	    app.config(function ($httpProvider) {
  	  	     $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
  	   	     delete $httpProvider.defaults.headers.common['X-Requested-With'];
	    });
           
            // Controller Part  
            app.controller("SalesSimController", function($scope, $http,$q) {  
                 
                $scope.offers = [];  
                $scope.marcas = ["americanas","shoptime","soubarato","submarino"];  
		$scope.marcaModel = $scope.marcas[0];

		// URL params
		$scope.productID_urlParam = '?product.id=';
		// B2W seller id
		$scope.sellerID_urlParam = '&seller.id=00776574000660';
		// TODO : hit no sku server
		//http://raml-portal.atlas.b2w/#/projects/product-api?version=V3
		$scope.skuID_urlParam = '&sku.id=';

                $scope.precoMIN;  
                $scope.precoMAX;  
                $scope.MAXY = [];  
		$scope.x1 = [];
		$scope.x2 = [];
		$scope.x3 = [];
		$scope.y1 = [];
		$scope.y2 = [];
		$scope.y3 = [];
		$scope.bbMINx;
		$scope.bbMAXx;
		$scope.count = [];
                $scope.boxes = ["box1","box2","box3"];  

		$scope.NO_PRODUCT_FOUND_ERR_MSG = 'Não foi possível encontrar dados para o produto escolhido';
		$scope.notified = false;

		// user data
                $scope.pricesForm = {  

                    itemID : "",
                    skuID : "",
                    marca : "",
                    precoMIN : "",                      
                    precoMAX : "",                      
                    precoCOMP : "",                      
                    amostragem : ""
                };      

/*		$scope.pioData = {

		    website : "ACOM",
		    itemId : 121137960,
		    skuId : 121137978,
		    maPrcAvgUprice : 1880.60,
		    avgCompetitorPrice : 2000,
		    maVisits : 2000,
		    nDay : "" 
		};*/

		$scope.pioData = {

		    website : "ACOM",
		    itemId : "",
		    skuId : "",
		    maPrcAvgUprice : "",
		    avgCompetitorPrice : 2000,
		    maVisits : 2000
		};

		_clearFormData();

		//http://validaproduto.b2w/

		$scope.mockURL = 'http://raml-portal.atlas.b2w/api/v1/mock/offer-api/v1/offer/';
		//$scope.marca1URL = '/americanas?product.id=128658397&sku.id=128658400';

		$scope.pioURL = '/forecasting/';


		//
		// ACCESSOR METHODS
		//
		$scope.getXCoords = function(panelID) {

			if (panelID === 1) return $scope.x1;	
			if (panelID === 2) return $scope.x2;	
			if (panelID === 3) return $scope.x3;	
		};

		$scope.getYCoords = function(panelID) {

			if (panelID === 1) return $scope.y1;	
			if (panelID === 2) return $scope.y2;	
			if (panelID === 3) return $scope.y3;	
		};

		$scope.setMarca = function(marca) {

			$scope.pricesForm.marca = marca;
			_clearFormData();
		};

		Number.prototype.formatMoney = function(c, d, t){
				var n = this, 
    				c = isNaN(c = Math.abs(c)) ? 2 : c, 
    				d = d == undefined ? "." : d, 
    				t = t == undefined ? "," : t, 
    				s = n < 0 ? "-" : "", 
    				i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    				j = (j = i.length) > 3 ? j % 3 : 0;
   				return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 		};

                $scope.pioCalc = function(i,count,panelID) {  

		    	$scope.pioData.maPrcAvgUprice = i;

			if (panelID === 1)
				$scope.pioData["nDay"] = 1;
			if (panelID === 2)
				$scope.pioData["eDay"] = 1;
			if (panelID === 3)
				$scope.pioData["bfDay"] = 1;


    			$http({
			
				method: 'POST',
				url: $scope.pioURL,
				headers: {'Content-Type': 'application/json','Accept': 'application/json'},
				data : angular.toJson($scope.pioData),

			}).then(function successCallback(results) {

				    $scope.getXCoords(panelID)[count] = i;
				    $scope.getYCoords(panelID)[count] = results.data.qtyItems; 
				
				    if ($scope.MAXY[panelID] < $scope.getYCoords(panelID)[count]) $scope.MAXY[panelID] = $scope.getYCoords(panelID)[count];

				    if ($scope.getXCoords(panelID).length === $scope.count[panelID])
					$scope.renderGraph(panelID);


				},function errorCallback(response) {

				    console.log(response.statusText);

				    if (!$scope.notified) {
					$scope.notified = true;
				    	alert ($scope.NO_PRODUCT_FOUND_ERR_MSG);
				    }

				}
			);

		};  

                $scope.fetchPrices = function() {  

			if ($scope.pricesForm.itemID && $scope.pricesForm.skuID) {

			$http({

			    method: 'GET',
			    url: $scope.marcaModel + $scope.productID_urlParam + $scope.pricesForm.itemID + $scope.sellerID_urlParam + $scope.skuID_urlParam + $scope.pricesForm.skuID,

			    headers: {
			       'Authorization': 'Authorization: Basic cHJlZGljdDpwcmVkaWN0aW8=',
    			       'Accept': 'application/json' 
  			  },
 			   data : angular.toJson($scope.pricesForm),
                   	 }).then(function successCallback(offers) {  

				if(offers.data.offers === 0) alert ($scope.NO_PRODUCT_FOUND_ERR_MSG);

				else {

                        		$scope.offers = offers.data.offers[0];  
                        		$scope.precoMIN = $scope.offers.listPrice - ($scope.offers.listPrice*10)/100;                    
                        		$scope.precoMAX = $scope.offers.listPrice + ($scope.offers.listPrice*10)/100;

                        		$scope.pricesForm.precoMIN = $scope.precoMIN.formatMoney(2,'.',',');
                        		$scope.pricesForm.precoMAX = $scope.precoMAX.formatMoney(2,'.',',');

                			$scope.pricesForm.amostragem = 10;
		    
					$scope.pioData.itemId = $scope.pricesForm.itemID;
					$scope.pioData.skuId = $scope.pricesForm.skuID;

					//if ($scope.pricesForm.precoCOMP)
		    			//	$scope.pioData.avgCompetitorPrice = $scope.pricesForm.precoCOMP;

				}

                    }, function errorCallback(response) {  
                        console.log(response.statusText);  
                    });  

		    }
                };  

                $scope.salesPredict = function() {  
		    
		    $scope.MAXY[1] = 0;
		    $scope.MAXY[2] = 0;
		    $scope.MAXY[3] = 0;
		
		    $scope.notified = false;

		    // BOX1 PIO
		    if ($scope.graphBox1) {

			$("#panelBox1").show();
			$scope.generateGraphCoords(1);
			

		    } else $("#panelBox1").hide();

		    // BOX2 PIO
		    if ($scope.graphBox2) {

			$("#panelBox2").show();
			$scope.generateGraphCoords(2);
			

		    } else $("#panelBox2").hide();

		    // BOX3 PIO
		    if ($scope.graphBox3) {

			$("#panelBox3").show();
			$scope.generateGraphCoords(3);
			

		    } else $("#panelBox3").hide();
		};

		$scope.generateGraphCoords = function(panelID) {

			$scope.bbMINx = Math.ceil($scope.pricesForm.precoMIN.replace(/,/g , ""));
			$scope.bbMAXx = Math.floor($scope.pricesForm.precoMAX.replace(/,/g , ""));

			var step = Math.round(($scope.bbMAXx - $scope.bbMINx)/$scope.pricesForm.amostragem);

			var count = 0;
                	for (i=$scope.bbMINx;i < $scope.bbMAXx;i=i + step) {

				$scope.pioCalc(i,count,panelID);
				count++;
                	}

			$scope.count[panelID] = count;

		};

		$scope.renderGraph = function(panelID) {

			var bbMAXy = $scope.MAXY[panelID];

			// TODO a percentage of the whole interval (25%)
			var bbMINx = $scope.bbMINx - $scope.bbMINx*(5/100);
			var bbMAXy = bbMAXy + bbMAXy*(45/100);
			var bbMAXx = $scope.bbMAXx + $scope.bbMAXx*(5/100);
			var bbMINy = -bbMAXy + (bbMAXy*(5/100));

			var brd = JXG.JSXGraph.initBoard($scope.boxes[panelID - 1],{
				boundingbox: [bbMINx,bbMAXy,bbMAXx,bbMINy],
				axis:true, 
				grid:false, 
				showCopyright:false, 
				showNavigation:true
		 	});

			for (i=0;i < $scope.count[panelID];i++)  {

				var px = $scope.getXCoords(panelID)[i];
				var py = $scope.getYCoords(panelID)[i];

				brd.create('point',[px,py], {size:2});

			}

			brd.create('curve', [$scope.getXCoords(panelID),$scope.getYCoords(panelID)]);

			brd.update();


			$scope.count[panelID] = 0;


		};


		//
		// PRIVATE METHODS
		//
                function _success(response) {  
                }  
           
                function _error(response) {  
                    console.log(response.statusText);  
                }  
           
                //Clear the form  
                function _clearFormData() {  

		    $scope.showBox1 = false;
		    $scope.showBox2 = false;
		    $scope.showBox3 = false;
                	
                    $scope.pricesForm.itemID = "";  
                    $scope.pricesForm.precoMIN = "";                    
                    $scope.pricesForm.precoMAX = "";                    
                    $scope.pricesForm.precoCOMP = "";                    
		
		    $scope.graphBox1 = false;
		    $scope.graphBox2 = false;
		    $scope.graphBox3 = false;
                };  
            });  

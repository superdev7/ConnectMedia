(function(){

	'use strict';

	var app = angular.module('System.Controllers');

	//The App Controller
	app.controller('BuyerController', [ '$window' , '$stateParams' , '$scope' , '$http' , '$location' , 'Config' , 'User' , 'Page' , 'Store' , 'Loader' , 'Upload' , function( $window , $stateParams , $scope , $http , $location , Config , User , Page , Store , Loader , Upload){
		User.ready(function(){

			if( Page.is( /^\/buyers\/report$/ ) && User.hasPermission([ 'buyerslogouts' , 'buyerslogouts.report' ]) ){




				/**
				*
				*	ROUTE: /buyers/report/([0-9]+)
				*		- View the Buyer Logout Report
				* 	
				* 	Params (URL):
				* 		- userid: 		(INT) The Buyer Logout ID to View
				*
				**/
				Page.loading.start();

				User.all(function(users){

					User.stores(function(stores){

						Page.loading.end();

						$scope.action 			= 'view';
						$scope.title 			= 'View Logout Report';
						$scope.button 			= 'Update Report';
						$scope.icon 			= 'pencil-square';
						$scope.hasError 		= Page.hasError;
						$scope.errors 			= [];
						$scope.logout 			= {};
						$scope.users 			= users;
						$scope.stores 			= stores;
						
						$scope.color 			= function(){
							return 'rgba(' + Math.round( Math.random() * 255 ) + ',' + Math.round( Math.random() * 255 ) + ',' + Math.round( Math.random() * 255 ) + ',.5)' ;
						}								

						$scope.dateSelect 		= function( logoutForm , type , wrapper ){
							logoutForm[ type ].$dirty = true;
							jQuery('[uib-dropdown-toggle]:nth(' + ( wrapper - 1 ) + ')').toggleClass('open');
							$scope.update( logoutForm );
						}

						//On Form Submit
						$scope.update 			= function( form ){
							if( form.$valid ){

								$http.get( ':api/buyerslogout/report' , { params: $scope.logout } ).then(function( response ){
									if( !response.data.result ){

										$scope.errors 	= response.data.errors;
										$window.scrollTo(0,0);

									}else{

										$scope.errors 	= [];
										$scope.report 	= response.data.data;
										var months 		= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
											colors 		= [ 'rgba(174,0,0,.5)', 'rgba(120,135,119,.5)', 'rgba(72,131,176,.5)', 'rgba(0,6,9,.5)', 'rgba(191,191,191,.5)', 'rgba(58,184,217,.5)', 'rgba(13,116,238,.5)', 'rgba(136,168,37,.5)', 'rgba(52,32,59,.5)', 'rgba(145,17,70,.5)', 'rgba(207,74,48,.5)', 'rgba(237,140,43,.5', 'rgba(148,209,172,.5)', 'rgba(143,190,255,.5)', 'rgba(255,250,141,.5)', 'rgba(232,150,58,.5)', 'rgba(255,151,188,.5)', 'rgba(176,196,216,.5)', 'rgba(109,114,0,.5)', 'rgba(244,157,3,.5)', 'rgba(246,138,7,.5)', 'rgba(192,54,3,.5)' ],
											reports		= {
												growth: 	{
													labels: 	[],
													datasets: 	[{
														label: 				'Sales',
														data: 				[],
														backgroundColor: 	colors[0]
													}]
												},
												customer: {
													labels: 	[],
													datasets: 	[{
														data: 				[],
														backgroundColor: 	[]
													}]
												},
												qsa: {
													labels: 	[],
													datasets: 	[{
														data: 				[],
														backgroundColor: 	[]
													}]
												}
										};

										//Prepare teh Accumulative Data
										for( var key in $scope.report.accumulative ){

											$scope.report.accumulative[ key ] = parseFloat( $scope.report.accumulative[ key ] ).toFixed( 2 );

										}

										//Add Spacing before
										reports.growth.labels.push('');
										reports.growth.datasets[0].data.push(null);

										//Build the Overview Data
										for( var i=0; i < $scope.report.monthly.length; i++ ){

											reports.growth.labels.push( months[ $scope.report.monthly[i].month - 1 ] + ' ' + $scope.report.monthly[i].year );

											reports.growth.datasets[0].data.push( $scope.report.monthly[i].sales );

										}

										//Add Spacing After
										reports.growth.labels.push('');
										reports.growth.datasets[0].data.push(null);

										//Sales Report
										new Chart( document.getElementById('growth').getContext('2d') , {
											type: 	'line',
											data: 	reports.growth
										} );


										setTimeout(function(){

											//This Fixes the hidden chart on safari
											jQuery( '.chartjs-hidden-iframe' ).css('height','auto');

										},50);

									}
								});
							}
						};


					});

				});



			}else
			if( Page.is( /^\/buyers\/view\/([0-9]+)$/ ) && User.hasPermission([ 'buyerslogouts' , 'buyerslogouts.view' ]) ){




				/**
				*
				*	ROUTE: /buyers/view/([0-9]+)
				*		- View the Buyer Logout	
				* 	
				* 	Params (URL):
				* 		- userid: 		(INT) The Buyer Logout ID to View
				*
				**/

				Page.loading.start();

				Loader.get( ':api/buyerslogout/' + $stateParams.logoutid , function( logout ){
					if( logout.data.data ){

						Page.loading.end();
						$scope.logout 				= logout.data.data;
						$scope.title 				= 'View  Logout: ' + $scope.logout.store.name + ' - ' + $scope.logout.start + ' to ' + $scope.logout.end ;
						$scope.icon 				= 'eye';
						
					}else{

						Page.error(404);

					}
				});





			}else
			if( Page.is( /^\/buyers\/edit\/([0-9]+)$/ ) && User.hasPermission([ 'buyerslogouts' , 'buyerslogouts.edit' ]) ){




				/**
				*
				*	ROUTE: /buyers/edit/([0-9]+)
				*		- Edit the Buyer Logout	
				* 	
				* 	Params (URL):
				* 		- userid: 		(INT) The Buyer Logout ID to Edit
				*
				**/

				Page.loading.start();

				User.all(function(users){

					User.stores(function(stores){

						Loader.get( ':api/buyerslogout/' + $stateParams.logoutid , function( logout ){
					
							Page.loading.end();

							$scope.sending 			= false;
							$scope.loading 			= false;
							$scope.timer 			= null;
							$scope.running 			= 'Updating';
							$scope.action 			= 'edit';
							$scope.title 			= 'Edit Buyer Logout';
							$scope.button 			= 'Edit Buyer Logout';
							$scope.icon 			= 'pencil-square';
							$scope.hasError 		= Page.hasError;
							$scope.errors 			= [];
							$scope.logout 			= logout.data.data;
							$scope.users 			= users;
							$scope.stores 			= stores;
							$scope.update 			= function(){ };			

							//On Date Select
							$scope.dateSelect = function( logoutForm , type , wrapper ){
								logoutForm[ type ].$dirty = true;
								jQuery('[uib-dropdown-toggle]:nth(' + ( wrapper - 1 ) + ')').toggleClass('open');
								$scope.save( $scope.logout );
							}



							//On Form Submit
							$scope.submit 	= function( form ){
								if( form.$valid && !$scope.sending ){

									$scope.sending = true;

									$http.post( ':api/buyers/' + $stateParams.logoutid , $scope.logout ).then(function( response ){
										if( !response.data.result ){

											$scope.sending 	= false;
											$scope.success 	= '';
											$scope.errors 	= response.data.errors;

											$window.scrollTo(0,0);

										}else{

											form.$setPristine();

											$scope.sending 	= false;
											$scope.errors 	= [];
											$scope.success 	= 'The Buyer Logout has been updated';							

											$window.scrollTo(0,0);

										}
									});

								}
							};


							$scope.update( $scope.logout.store_id );

						})

					});

				});
				






			}else
			if( Page.is( /^\/buyers\/add$/ ) &&  User.hasPermission([ 'buyerslogouts' , 'buyerslogouts.create' ])  ){


				/**
				*
				*	ROUTE: /buyers/add
				*		- Add a New Buyer Logout	
				* 	
				* 	Params (URL):
				* 		n/a
				*
				**/

				User.all(function(users){

					User.stores(function(stores){
					
						Page.loading.end();

						$scope.sending 			= false;
						$scope.loading 			= true;
						$scope.timer 			= null;
						$scope.saving 			= false;
						$scope.running 			= 'Creating';
						$scope.action 			= 'insert';
						$scope.title 			= 'Add Logout';
						$scope.button 			= 'Add Logout';
						$scope.icon 			= 'plus-circle';
						$scope.hasError 		= Page.hasError;
						$scope.errors 			= [];
						$scope.logout 			= angular.extend( {} , { store_id: ( stores.length ? String(stores[0].id) : null ) } );
						$scope.users 			= users;
						$scope.stores 			= stores;


						//Save the Form
						$scope.save 	= function( form ){

							if( $scope.timer ) window.clearTimeout( $scope.timer );

							$scope.saving 	= true;
							$scope.timer 	= window.setTimeout(function(){

								$http.put( ':api/buyerslogout/save' , $scope.logout ).then(function( response ){

									$scope.saving = false;

								});

							}, 1000);

						};

						//Load the Store Data
						$scope.update 	= function( store_id ){
							Loader.get( ':api/buyerslogout/active/' + store_id , function( logout ){

								$scope.logoutForm.$setPristine();

								$scope.loading 	= false;

								$scope.logout 	= angular.extend( logout.data.data || {} , {

									store_id : $scope.logout.store_id

								});

								return;
							});
						}					

						//On Date Select
						$scope.dateSelect = function( logoutForm , type , wrapper ){
							logoutForm[ type ].$dirty = true;
							jQuery('[uib-dropdown-toggle]:nth(' + ( wrapper - 1 ) + ')').toggleClass('open');
							$scope.save( $scope.logout );
						}

						//On Form Submit
						$scope.submit 	= function( form ){
							if( form.$valid && !$scope.sending ){

								$scope.sending = true;

								$http.put( ':api/buyerslogout' , $scope.logout ).then(function( response ){
									console.log( response );
									if( !response.data.result ){


										$scope.sending 	= false;
										$scope.success 	= '';
										$scope.errors 	= response.data.errors;

										$window.scrollTo(0,0);

									}else{

										form.$setPristine();

										$scope.sending 	= false;
										$scope.errors 	= [];
										$scope.success 	= 'The Buyer Logout has been Submitted';

										$scope.update( $scope.logout.store_id );
						

										$window.scrollTo(0,0);

									}
								});

							}
						};


						$scope.update( $scope.logout.store_id );


					
					});

				});









			}else
			if( Page.is( /^\/buyers(\/[0-9]+)?$/ ) && User.hasPermission([ 'buyerslogouts' ])  ){

				/**
				*
				*	ROUTE: /buyers/([0-9]+)?
				*		- The Buyer Logout List
				* 	
				* 	Params (URL):
				* 		- page: 		(INT) Buyer Logouts Listing Pagination
				*
				**/
				(function(){

					$scope.page.data 		= [];
					$scope.query 			= '';
					$scope.list 			= { query: '', loading: false };
					
					//On Page Load
					$scope.load 			= function( page , searching ){

						Page.loading.start();

						var limit 		= $scope.page.showing;

						Loader.get( ':api/buyerslogout' + ( limit ? '/' + limit : '' ) + ( page ? '/' + page : '' ) , function( buyers ){
							if( buyers ){

								if( buyers.data.data.length > 0 || page == 1 ){

									if( $scope.page.current != page ){

										$location.path( '/buyers' + ( page > 1 ? '/' + page : '' ) );

									}

									$.extend( $scope.page , { current: page }, buyers.data );

								}else
								if( !searching ){

									Page.error(404);

								}

								Page.loading.end();

								$scope.list.loading = false;

							}
						});

					};

					//On "Click Delete"
					$scope.delete 		= function( logout ){
						if( User.hasPermission([ 'buyerslogouts.delete' ]) ){

							jQuery.confirm({
							    title: 				'Are you sure?',
							    content: 			'Are you sure you want to delete logout ' + logout.id,
							    confirmButton: 		'Delete Buyer Logout',
								confirmButtonClass: 'btn-danger',
							    cancelButton: 		'Cancel',
								cancelButtonClass: 	'btn bgaaa coloraaa hoverbg555 hovercolorfff',
							    confirm: 			function(){

							    	$http.delete( ':api/buyerslogout/' + logout.id ).then(function( response ){
							    		if( !response.data.result ){

							    			$scope.success 	= '';
							    			$scope.errors 	= response.data.errors;

							    			$window.scrollTo(0,0);

							    		}else{

							    			$scope.errors 	= [];
							    			$scope.success 	= 'Buyer Logout ' + logout.id + ' has been deleted.';

							    			$scope.load( 1 );

							    			$window.scrollTo(0,0);

							    		}
							    	});

							    }
							});
						}

					}

					//Load the First Page
					$scope.load( ( $stateParams.page || 1 ) , false );

				})();




			}else{


				Page.loading.end();
				Page.error(404);


			}

		});
	}]);


})();
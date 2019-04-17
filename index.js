var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var localStorage = require('localStorage');
var bodyParser = require('body-parser');
var moment = require('moment');

var validator = require('validator');

var session = require('express-session');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

var jwt = require('jsonwebtoken');


var token_login ;
// parse application/json
app.use(bodyParser.json())

const functions = require('firebase-functions');

var admin = require("firebase-admin");
var serviceAccount = require('../admin-2ba0b-firebase-adminsdk-rzb4n-9fe8cd25e1.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://admin-2ba0b.firebaseio.com/'});
app.use(session({ secret: 'keyboard cat'}))
app.set('view engine', 'ejs')
app.use('/xyz', express.static(__dirname + '/assets'));


var db = admin.database();
app.use(cookieParser());

// app.use(function(req,res,next){
// 	// var xyz = localStorage.getItem('tokendata');
// 	// console.log(xyz);
// 	if(xyz === null){
// 		if(req.url == '/dashboard'){
// 			res.redirect('/');
// 		}
// 		else{
// 			next();
// 		}
// 	}
// 	else{
// 		next();
// 	}
// })



app.get('/',function(req,res){
	res.set('Cache-Control','public, max-age=300, s-maxage=600');
	// var xyz = localStorage.getItem('tokendata');
	// console.log(xyz);
	res.render('index');
});



app.get('/dashboard',function(req,res){
	


	// console.log(db);
	var tokendata = localStorage.getItem('token');
	// alert(tokendata);
	var newtoken = tokendata;


	jwt.verify(newtoken, 'dixit', function(err, decoded) {
	  // console.log(decoded) // bar
	   res.render('dashboard',{key:decoded});
	});
	// console.log(tokendata);
	// res.render('dashboard');
});

app.get('/allleads',function(req,res){
	db.ref('AllLeads/').once('value').then(function(snapshot){

	var value=snapshot.val();
	// console.log("========")
	// console.log(value)
	 res.render('allleads',{key:value});	

	});

	
});
app.get('/user_leaddetails/:emailid',function(req,res){
	var emailiddata=req.params.emailid;
	// console.log(emailiddata);
	var ref=db.ref('/AllLeads');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			if(childSnapshot.key == emailiddata ){
					
					user_leads=childSnapshot.val();
					// console.log(user_leads);
					// var fdata;
					// for (var data in user_leads){
					// 	 fdata=fdata.push(user_leads[data]);

					// }
					// console.log(fdata);
					// console.log(user_leads.child("yadavrahul1247@gmail_com").val());
					res.render("user_leaddetails",{key:user_leads});



					// 
			}
			
		})
	})


});


app.get('/addleads',function(req,res){
	res.render('addleads');	

});

app.get('/viewuser',function(req,res){
	db.ref('RegisteredUser/').once('value').then(function(snapshot){

		var value=snapshot.val();
		// console.log(value);
		res.render('viewuser',{key:value});	

	})
})

app.post('/addlead_action',function(req,res){
	// console.log(req.body);
	
	var emailuser=req.body.emailuser;
	var name=req.body.name;	
	var email=req.body.email;
	var mob=req.body.mob;
	var where=req.body.where;
	var requirement=req.body.requirement;
	var addrss1=req.body.addrss1;
	var addrss2=req.body.addrss2;
	var pincode=req.body.pincode;
	var req_city=req.body.req_city;
	var req_location=req.body.req_location;

	var newemail=email.replace(/\./g,"_");
	var emailuser=emailuser.replace(/\./g,"_");
	if(where == 'Company'){




	var newdata={
					name:name,
					email:newemail,
					mob:mob,
					name:name,
					where:where,
					requirement:requirement,
					addrss1:addrss1,
					addrss2:addrss2,
					pincode:pincode,
					req_city:req_city,
					req_location:req_location

				}
				var data = db.ref("CompanyLeads/"+emailuser+"/"+newemail);


				data.set(newdata);
				res.redirect("addleads");
	}
	else
	{



		var newdata={
					name:name,
					email:newemail,
					mob:mob,
					name:name,
					where:where,
					requirement:requirement,
					addrss1:addrss1,
					addrss2:addrss2,
					pincode:pincode,
					req_city:req_city,
					req_location:req_location

				}
				var data = db.ref("OwnLeads/"+emailuser+"/"+newemail);


				data.set(newdata);

				
				res.redirect("addleads");
	}					
})

app.get('/followup/:emailid',function(req,res){
	var emailiddata=req.params.emailid;
	
	var newemail=emailiddata.replace(/\./g,"_");
	// console.log(newemail);
	res.render('followup',{key:newemail});	

})
app.get('/companyleads',function(req,res){
db.ref('AllLeads/').once('value').then(function(snapshot){

	var value=snapshot.val();
	// console.log("========")
	// console.log(value)
	 res.render('companyleads',{key:value});	

	});
// res.render('companyleads');
})




app.post('/addfollowup_action',function(req,res){
data = req.body;

var mainkeynode=req.body.personemailkey;
var secondkeynode=req.body.leademailkey;
var thirdkeynode=req.body.callstatus;
var stats=req.body.next_action;
var notes=req.body.notes;
var timestamp= Date.now();
// console.log(datenow)
var emailstates=secondkeynode.replace(/\_/g,".");
// console.log(emailstates);
if(thirdkeynode == "Ringing" ){
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;
					// console.log();

					var newdata={
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						stats:stats,
						timestamp:timestamp
					};


					var history={
						action:thirdkeynode,
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						stats:stats,
						timestamp:timestamp
					}
					// console.log(mainkeynode);
					// console.log(secondkeynode);
					// console.log(thirdkeynode);

					// console.log(newdata);
					// +mainkeynode+"/"+secondkeynode+"/"+thirdkeynode
					

					var data = db.ref("FollowUps/"+ mainkeynode +"/"+ secondkeynode +"/"+ thirdkeynode);


					data.set(newdata);

					var datas = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datas.set(history);

					
					res.redirect("followup/"+database_email);

				}
				

		})
})
	// console.log(ref);

}


else if(thirdkeynode == "Call Again")
{
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;
					// console.log();

					var newdata={
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						
						timestamp:timestamp
					};



					// console.log(mainkeynode);
					// console.log(secondkeynode);
					// console.log(thirdkeynode);

					 // console.log(newdata);
					// +mainkeynode+"/"+secondkeynode+"/"+thirdkeynode
					

					var data = db.ref("FollowUps/"+ mainkeynode +"/"+ secondkeynode +"/"+ thirdkeynode);


					data.set(newdata);

					var datas = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datas.set(newdata);


					res.redirect("followup/"+database_email);

				}
				

		})
})
}

else if(thirdkeynode == "Apt Fixed")
{

	
	var reason=data.reason;
	

	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

				
						// console.log(childSnapshot.val());
					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;

					var newdata={
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						reason:reason,
						stats:thirdkeynode,
						time:"",
						timestamp:timestamp
					};
					// console.log(newdata);
					// console.log("AppnFix/"+ mainkeynode +"/"+secondkeynode+"/"+ thirdkeynode);
						// mainkeynode +"/"+secondkeynode +"/"+ thirdkeynode 
					var datas = db.ref("AppnFix/"+ mainkeynode +"/"+secondkeynode+"/"+ thirdkeynode);


					datas.set(newdata);

					var datans = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datans.set(newdata);
					res.redirect("followup/"+database_email);


				}
			});
		});



}

else if(thirdkeynode == "Apt Done")
{

	// console.log(data);
	var amt=data.amt;
	var proposal_send=data.proposal_send;
	var visit=data.visit;
	// return false;
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

				
						// console.log(childSnapshot.val());
					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;



					var newdata={
						amnt:amt,
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						proposal_send:proposal_send,
						stats:thirdkeynode,
						timestamp:timestamp,
						visit:visit
					};	
					// console.log(newdata);
					var datas = db.ref("TillDateVisit/"+ mainkeynode +"/"+secondkeynode+"/"+ timestamp);


					datas.set(newdata);


					var dataans = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					dataans.set(newdata);
					res.redirect("followup/"+database_email);


				}
			});
		});		

}


else if(thirdkeynode == "Wrong Num")
{
	// console.log(data);
	// return false;
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

				
						// console.log(childSnapshot.val());
					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;



					var newdata={
						
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						stats:thirdkeynode,
						timestamp:timestamp
					};	
					// console.log(newdata);
					var datas = db.ref("WrongDetail/"+ mainkeynode +"/"+secondkeynode+"/"+ timestamp);


					datas.set(newdata);


					var datanss = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datanss.set(newdata);
					res.redirect("followup/"+database_email);


				}
			});
		});

}	
// 
else if(thirdkeynode == "Not Reachable")
{
	// console.log(data);
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;
					// console.log();

					var newdata={
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						stats:thirdkeynode,
						timestamp:timestamp
					};

					// console.log(mainkeynode);
					// console.log(secondkeynode);
					// console.log(thirdkeynode);

					// console.log(newdata);
					// +mainkeynode+"/"+secondkeynode+"/"+thirdkeynode
					

					var data = db.ref("FollowUps/"+ mainkeynode +"/"+ secondkeynode +"/"+ thirdkeynode);


					data.set(newdata);

					var datanss = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datanss.set(newdata);
					res.redirect("followup/"+database_email);

				}
				

		})
})
}

else if(thirdkeynode == "Not Interested")
{
	// console.log(data);
	var visit=data.visit_notinterested;
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;
					// console.log();

					var newdata={
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						stats:thirdkeynode,
						timestamp:timestamp,
						visit:visit
					};

					// console.log(mainkeynode);
					// console.log(secondkeynode);
					// console.log(thirdkeynode);

					// console.log(data);
					// +mainkeynode+"/"+secondkeynode+"/"+thirdkeynode
					

					var data = db.ref("NotInt/"+ mainkeynode +"/"+ secondkeynode +"/"+ thirdkeynode);


					data.set(newdata);


					var datanss = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datanss.set(newdata);

					res.redirect("followup/"+database_email);

				}
				

		})
})



}


else if(thirdkeynode == "Deal Closed")
{
	// console.log(data);

	var next_action=data.next_action;
	var time=data.time;
	var visit_dealclose=data.visit_dealclose;
	var deal_proposal=data.deal_proposal;
	var rec_amnt=data.deal_receivedamt;
	var stats=data.thirdkeynode;
	var visit_dealclose=data.visit_dealclose;
	var visit_dealclose=data.visit_dealclose;
	var visit_dealclose=data.visit_dealclose;
	var visit_dealclose=data.visit_dealclose;



	// return false;

	var visit=data.visit_notinterested;
	var ref=db.ref('AllLeads/'+mainkeynode+'/');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
				if(childSnapshot.key == secondkeynode ){

					var database_email=childSnapshot.val().email;
					var database_mob=childSnapshot.val().mob;
					var database_name=childSnapshot.val().name;
					var database_where=childSnapshot.val().where;
					// console.log();

					var newdata={
						amnt:rec_amnt,
						email:database_email,
						mob:database_mob,
						name:database_name,
						notes:notes,
						rec_amnt:rec_amnt,
						stats:thirdkeynode,
						timestamp:timestamp,
						visit:visit_dealclose
					};

					// console.log(mainkeynode);
					// console.log(secondkeynode);
					// console.log(thirdkeynode);

					// console.log(newdata);
					// +mainkeynode+"/"+secondkeynode+"/"+thirdkeynode
					

					var data = db.ref("TillDateVisit/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);


					data.set(newdata);

					var datanss = db.ref("FollowUpsHist/"+ mainkeynode +"/"+ secondkeynode +"/"+ timestamp);
					datanss.set(newdata);

					res.redirect("followup/"+database_email);

				}
				

		})
})



}



})
app.get('/followupdetails/:emailid/:emailidtwo',function(req,res){

var emailiddata=req.params.emailid;

var emailidtwo=req.params.emailidtwo;	
// console.log(emailiddata);
var emailiddata=emailiddata.replace(/\./g,"_");
var emailidtwo=emailidtwo.replace(/\./g,"_");	


// console.log(emailidtwo);
// console.log(emailiddata);
var ref=db.ref('/FollowUpsHist');
ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			childSnapshot.forEach(function(smallchildSnapshot){
			
				if(smallchildSnapshot.key == emailidtwo ){



					var followuphistory=smallchildSnapshot.val();
					res.render("FollowUpsHist",{key:followuphistory});


				}
			})
		});
		// console.log(snapshot.val());
	});		


})

app.get('/compayuser_leaddetails/:emailid',function(req,res){
	var emailiddata=req.params.emailid;
	// console.log(emailiddata);
	var ref=db.ref('/AllLeads');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			if(childSnapshot.key == emailiddata ){
					
					user_leads=childSnapshot.val();
					// console.log(user_leads);
					// var fdata;
					// for (var data in user_leads){
					// 	 fdata=fdata.push(user_leads[data]);

					// }
					// console.log(fdata);
					// console.log(user_leads.child("yadavrahul1247@gmail_com").val());
					res.render("companyuser_leaddetails",{key:user_leads});



					// 
			}
			
		})
	})


});




app.get('/ownleads',function(req,res){
db.ref('AllLeads/').once('value').then(function(snapshot){

	var value=snapshot.val();
	// console.log("========")
	// console.log(value)
	 res.render('ownleads',{key:value});	

	});
// res.render('companyleads');
})
app.get('/ownuser_leaddetails/:emailid',function(req,res){
	var emailiddata=req.params.emailid;
	// console.log(emailiddata);
	var ref=db.ref('/AllLeads');
	ref.once('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			if(childSnapshot.key == emailiddata ){
					
					user_leads=childSnapshot.val();
					// console.log(user_leads);
					// var fdata;
					// for (var data in user_leads){
					// 	 fdata=fdata.push(user_leads[data]);

					// }
					// console.log(fdata);
					// console.log(user_leads.child("yadavrahul1247@gmail_com").val());
					res.render("ownuser_leaddetails",{key:user_leads});



					// 
			}
			
		})
	})


});



app.get('/adduser',function(req,res){
res.render('adduser');
})





app.post('/register_action',function(req,res){
	data = req.body;
	// console.log(data.user_role);

	if(!validator.isEmail(data.email)){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Please Enter Your Email Address</div>");
	}
	else if(!validator.matches(data.mobile,/^[0-9][0-9]{9}$/)){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Please Enter Your 10 Digit Mobile Number</div>");
	}
	else if(!validator.matches(data.name,/^[a-zA-Z][a-zA-Z]+[a-zA-Z]$/)){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Please Enter Your Name</div>");
	}
	else if(!validator.isAlphanumeric(data.password) || !validator.isLength(data.password,{min:4 , max:8})){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>please Enter Your password Alpha Numeric</div>");
	}
	else if(!validator.equals(data.password,data.cpassword)){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Your Confirm password is not match with current password</div>");
	}
	else if(data.user_role == "null"){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Please Select User Role</div>");
	}
	else
	{	
	var email=req.body.email;
	
	var mobile=req.body.mobile;
	var name=req.body.name;
	var password=req.body.password;
	var user_role=req.body.user_role;
	 var newemail=email.replace(/\./g,"_");

	var ref=db.ref('RegisteredUser/');

	ref.once('value',function(snapshot){
		var ans = snapshot.val();
		if(snapshot.hasChild(newemail)){



			res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>User Already Exists</div>");
		}
		else
		{

			var newdata={
					email:newemail,
					mobile:mobile,
					name:name,
					password:password,
					user_role:user_role
				}
				var data = db.ref("RegisteredUser/"+newemail);


				data.set(newdata);
			res.send("1");
		}
	})

	// 
	}	
	


})


app.post('/login_action',function(req,res){
	data = req.body;
	// console.log(data);
	if(!validator.isEmail(data.email)){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;margin-bottom: 15px;'>Please Enter Your Email Address</div>");
	}
	else if(!validator.isAlphanumeric(data.password) || !validator.isLength(data.password,{min:4 , max:8})){
		res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;margin-bottom: 15px;'>please Enter Your password Alpha Numeric</div>");
	}
	else
	{
		var email=data.email;
		var password=data.password;
		var newemail = email.replace(/\./g,'_')

		// var newemail=email.replace(".","_");
		

		var ref=db.ref('/RegisteredUser');
		ref.orderByChild('email').equalTo(newemail).once('value').then(function (snapshot) {
					var value = snapshot.val();
						
					if(value){
						
						snapshot.forEach(function(childSnapshot){
							var datafnans=childSnapshot.val();
							// console.log(datafnans);
							
							if(password == datafnans.password){


									var newemaildata = datafnans.email.replace(/\_/g,'.');
									
									var newmobile=datafnans.mobile;
									var newname=datafnans.name;
									var newpassword=datafnans.password;
									var newuser_role=datafnans.user_role;	
									
									var datas = {
										name:newname,
										mob:newmobile,
										role:newuser_role,
										newemail:newemail,
										newemaildata:email

									}

									jwt.sign(datas, 'dixit', { expiresIn: '1h' },function(err,token){
										// console.log(token);
										// console.log(err);
										// token_login = token
						  				// localStorage.setItem('tokendata', token);

								
									// console.log(newmobile);
									
									localStorage.setItem('token', token);
									localStorage.setItem('newmobiledata', newmobile);
									localStorage.setItem('newnamedata', newname);
									localStorage.setItem('newuser_roledata', newuser_role);


									// res.send("test");						
									// console.log(11111);				


									// app.locals.log_email = newemaildata;
									// app.locals.log_mobile = newmobile;
									// app.locals.log_name = newname;
									// app.locals.log_userole = newuser_role;
									// console.log(token);
									res.send("done#"+token);

									});

							}	
							else
							{
								res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>Please Enter Correct password </div>");
							}


						})
						


					}
					else
					{
						res.send("<div style='color: #de1616;font-size: 15px;text-align: center;font-weight: 700;'>User Not Found</div>");
					}
   			 });

		
	}
})


// app.get('/viewuserdetails/:emailid',function(req,res){
	
app.get('/viewuserdetails/:emailid',function(req,res){
	// console.log();
	var emailiddata=req.params.emailid;

	var ref=db.ref('RegisteredUser/');

	ref.orderByChild("email").equalTo(emailiddata).on("child_added",function(data){
		var value=data.val();

		 res.render('viewuserdetails',{key:value});	

	})

})




app.get('/addlead',function(req,res){
	res.render('addlead');
})


app.get('/logout',function(req,res){
	 	
	 // 	delete app.locals.log_email;
		// delete app.locals.log_mobile;
		// delete app.locals.log_name;
		// delete app.locals.log_userole;

		
		localStorage.clear();
		res.redirect('/');

	// req.session.destroy(function(err){
	// 	res.redirect('/');
	// })
})


// app.get("/zzz",function(req,res){
// 	// console.log();
// 	      res.cookie('mycookies', 'express',{expire: 360000 + Date.now()})
//        .send('cookie set');


// })

// app.get('/aaaa',function(req,res){

// })



// app.get("/abc",function(req,res){
// 	myValue = localStorage.getItem('newmobiledata');
// 	newnamedata = localStorage.getItem('newnamedata');
// 	// console.log(newnamedata);
// })



exports.app = functions.https.onRequest(app);

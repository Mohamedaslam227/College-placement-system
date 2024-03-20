const express = require('express');
const mysql= require('mysql2');
const cors= require('cors');
const app= express();
app.use(cors());
app.use(express.json());
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '@slAmalef12',
    database: 'registration'
}).promise(); 
async function fetchData() {
    try {
        const [rows] = await db.query("SELECT * FROM registration");
        console.log(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchOne(Email) {
    try {
        const [rows] = await db.query("SELECT * FROM registration where Email=?",[Email]);
        console.log(rows[0]);
        return rows[0];
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}



async function validate(Email, password) {
    try {
        const [rows] = await db.query("SELECT Email, Password FROM registration WHERE Email = ? AND Password = ?", [Email, password]);
        if (rows.length > 0) {
            console.log("User found:", rows[0]);
            return true; 
        } else {
            console.log("User not found or invalid credentials.");
            return false; 
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return false; 
    }
}

//fetchData();

async function putData(Email,name,Age,Dob,cgpa,password,ResidentAdd,Department,AdmissionNo,backlog,BacklogCount)
{
    try{
        const result= await db.query(`INSERT INTO registration(Email,Name,Age,Dob,Cgpa,Password,ResidentAdd,Department,AdmissionNo,Backlog,Backlogcnt) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?)`,[Email,name,Age,Dob,cgpa,password,ResidentAdd,Department,AdmissionNo,backlog,BacklogCount]);
        const val=fetchOne(Email);
        console.log(val);
    }
    catch(error)
    {
        console.error('Error Inserting Data:',error);
    }
   
}



app.post('/Registrations', async function(req, res) {
    console.log("Inside post");
    console.log(req.body);
    console.log(req.body.email);
    let backlcnt = 0;
    if (req.body.backlog === 'no') {
        backlcnt = 0;
    } else {
        backlcnt = parseInt(req.body.backlogCount);
    }
    console.log(backlcnt);
    
    try {
        await putData(
            req.body.email,
            req.body.name,
            parseInt(req.body.age),
            req.body.dob,
            parseFloat(req.body.cgpa),
            req.body.password,
            req.body.address,
            req.body.department,
            parseInt(req.body.admissionNumber),
            req.body.backlogs,
            backlcnt
        );

        
        res.send('Data inserted successfully! Redirecting...');
    } catch (error) {
      
        console.error('Error:', error);
        res.status(500).send('Error inserting data. Please try again later.');
    }
});


app.post('/Registrations', function(req, res) {
    setTimeout(() => {
        res.redirect('/');
    }, 3000);
});



/*app.post('/Login', async (req, res) => {
    const { email, password, role } = req.body;
    console.log(email,password);

    if (role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Only students are allowed to log in.' });
    }

    try {
        
        const isValidUser = await validate(email, password);

        if (isValidUser) {
            return res.status(200).json({ message: 'Login successful!' });
        } else {
            return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});*/
app.post('/Login', async (req, res) => {
    const { email, password, role } = req.body;
    console.log(email, password);

    try {
        const validRoles = ['student', 'faculty', 'company', 'studentOfficer', 'parent', 'admin', 'placementOfficer'];

        if (!validRoles.includes(role)) {
            return res.status(403).json({ error: 'Access denied. Invalid user role.' });
        }

        switch (role) {
            case 'student':
                try {

        
                    const isValidUser = await validate(email, password);
            
                    if (isValidUser) {
                        console.log(isValidUser);
                        return res.status(200).json({message:"login successful"});
                    } else {
                        return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
                    }
                } catch (error) {
                    console.error('Error during login:', error);
                    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
                };
                break;
            case 'faculty':
           
                break;
            case 'company':
                try{
                    const results= await db.query('SELECT CompanyId FROM companylogin WHERE CompanyId=? AND Password=?',[email,password]);
                    if (results.length > 0) {
                        console.log("User found:", results[0]);
                        res.status(200).json(results[0]);
                    }else {
                    console.log("User not found or invalid credentials.");
                    return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
                    }
    
                }
                catch (error) {
                    console.error('Error during login:', error);
                    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    
                };
                break;
            case 'studentOfficer':
                break;
            case 'parent':
                
                break;
            case 'admin':
               
                break;
            case 'placementOfficer':
                break;
            default:
                return res.status(403).json({ error: 'Access denied. Unknown user role.' });
        }

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});


app.post('/StudentDetails', async(req, res) => {
    const { email } = req.body;
    console.log(email);
    const [results] = await db.query("SELECT * FROM registration WHERE Email = ?", [email]);
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(200).json(results[0]); 
      }
    });

/*app.post('/fetchUserName', async(req, res) => {
    const { userId } = req.body;
    console.log(userId);
    const [rows] = await db.query("SELECT Email FROM registration WHERE Email = ?", [userId]);
    console.log(rows);
      if (rows.length > 0) {
        res.json({name: result[0].Name });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
    */

app.post('/CompanyDetails', async(req, res) => {
    try{
    const [results] = await db.query("SELECT * FROM Jobs");
    console.log(results);
    console.log(results[0]);
    res.status(200).json(results);
    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }

});
app.post('/Companyreg', async(req, res) => {
    console.log(req.body);
    try{
        const result= await db.query(`INSERT INTO Jobreg (jobid, company_mail, company_name, applying_designation, minimum_cgpa, user_mail) 
        VALUES (?, ?, ?, ?, ?, ?);`,[req.body.JobId,req.body.CompanyMail,req.body.CompanyName,req.body.JobDesignation,req.body.Cgpa,req.body.UserMail]);
        res.status(200).json(result);
    }
    catch(error)
    {
        console.error('Error Inserting Data:',error);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }

});
app.post('/JobHistory', async(req, res) => {
    try{
        const [results] = await db.query("SELECT * FROM Jobreg WHERE user_mail=?",[req.body.email]);
        console.log(results);
        console.log(results[0]);
        res.status(200).json(results);
        }
        catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }

});

app.post('/RegDetails', async(req, res) => {
    try {
        const results = await db.query("SELECT user_mail FROM jobreg WHERE company_mail=?", [req.body.email]);
        console.log(results);
        if (results.length > 0) {
            console.log(results[0]);
            res.status(200).json(results[0]); // Sending the first result only
        } else {
            res.status(404).json({ error: 'No registration details found.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});
app.post('/MoreDetails', async (req, res) => {
  try {
    const uniqueEmails = req.body.uniqueEmails;
    console.log(uniqueEmails); 

    if (!Array.isArray(uniqueEmails)) {
      throw new Error('Invalid request data');
    }
    const userDetails = await Promise.all(uniqueEmails.map(async ({ index, email }) => {
      const result = await db.query("SELECT * FROM registration WHERE Email = ?", [email.user_mail]);
      return  result[0][0] ;
    }));
    console.log(userDetails);

    res.status(200).json(userDetails);
  } catch (error) {
    console.error('Error fetching more details:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

app.post('/Update', async (req, res) => {
    const mail=req.body.values.mail;
    const status=req.body.values.status;
    const company=req.body.values.company_mail;
    console.log(mail,status);
    try{
        const results = await db.query("Update jobreg SET Status=? Where user_mail=? and company_mail=?", [status,mail,company]);
    
    
    if (results.affectedRows > 0) {
        res.status(200).json({ message: 'Registration details updated successfully.' });
    } else {
        res.status(404).json({ error: 'No registration details found to update.' });
    }
} catch (error) {
    console.error('Error during updating registration details:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
}


});
  
  

app.listen(8081,()=>{
    console.log('listening on 8081');
});



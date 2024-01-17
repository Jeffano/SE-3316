const express = require('express'); // Express framework to handle HTTP requests
const mongoose = require('mongoose') // Import the mongoose module to connect to MongoDB
const cors = require('cors');

const app = express(); // This line creates an instance of the Express application.
const router = express.Router(); // This line creates a new router object that can be used to define routes.
const user = express.Router(); // This line creates a new router object for handling user-related routes.
const admin = express.Router(); // This line creates a new router object for handling admin-related routes.
const guest = express.Router(); // This line creates a new router object for handling guest-related routes.

const port = 3001; // This line defines the port number (3001) on which the server will listen for incoming requests.
const path = require('path'); // This line imports the built-in Node.js 'path' module, which provides utilities for working with file and directory paths.
const fs = require('fs'); // This line imports the built-in Node.js 'fs' (file system) module, which provides an API for interacting with the file system.

mongoose.connect('mongodb://localhost/superheros') // This line establishes a connection to a MongoDB database named 'superheros' running on localhost.
const db = mongoose.connection // This line gets a reference to the database connection established by Mongoose.

db.on('error', (error) => console.error(error));
db.once('open', async () => {
    console.log('Connected To Database');
    await checkConnections();  // Ensuring we are connected before checking the collections
    app.listen(port, () => {
        console.log(`Server Running on Port: ${port}`);
    });
});

// Serve static files (like HTML, CSS, JS) from the 'client' directory
app.use('/', express.static(path.join(__dirname, '..', 'client')));

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json()); // Use JSON parser middleware for parsing JSON data in request body
app.use('/api/superheroes', router); // This line mounts the 'router' middleware at the '/api/superheroes' path. Any request starting with '/api/superheroes' will be handled by 'router'.
app.use('/api/secure/', user); // This line mounts the 'user' middleware at the '/api/secure/' path. Any request starting with '/api/secure/' will be handled by 'user'.
app.use('/api/admin/', admin); // This line mounts the 'admin' middleware at the '/api/admin/' path. Any request starting with '/api/admin/' will be handled by 'admin'.
app.use('/api/open/', guest); // This line mounts the 'guest' middleware at the '/api/open/' path. Any request starting with '/api/open/' will be handled by 'guest'.

// Middleware for logging: It logs every request made to the server
app.use((req, res, next) => {
    console.log(`${req.method} Request For: ${req.url}`);
    next(); // Pass control to the next middleware function
});


const reviewSchema = new mongoose.Schema({
    rating: Number,
    comment: String,
    userName: String,
    createdAt: Date
});

const listSchema = new mongoose.Schema({
    listName: String,
    superheroIDs: [Number],
    description: String,
    visibility: { type: Boolean, default: false },
    reviews: [reviewSchema],
    updatedAt: Date
});

const userDataSchema = new mongoose.Schema({
    jwtToken: String,
    userEmail: String,
    userName: String,
    role: String,
    status: String,
    lists: [listSchema]
});

const UserData = mongoose.model('UserData', userDataSchema, 'UserData');

user.post('/accessCollection', async (req, res) => {
    const { userEmail, userName } = req.body;
    console.log(userEmail, userName);

    try {
        // Check if a user with the given email already exists
        let userData = await UserData.findOne({ userEmail: userEmail });

        if (!userData) {
            // User does not exist, create a new document with userEmail, userName, role and status
            userData = new UserData({
                userEmail: userEmail,
                userName: userName,
                role: "User", // Default role
                status: "Enabled" // Default status
            });
            await userData.save();

            res.status(201).json({ message: "Account Created", userData });
        } else {
            // If userEmail already exists, send a message indicating so
            res.status(200).json({ message: "Email Already Exists", userData });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error storing user data", error: error.message });
    }
});

user.put('/updateCollection', async (req, res) => {
    const { email, token } = req.body;

    try {
        // Find the user by email
        let userData = await UserData.findOne({ userEmail: email });

        if (userData) {
            // If user exists, update the JWT token
            userData.jwtToken = token;
            await userData.save();

            res.status(200).json({ message: "JWT Token updated successfully", userData });
        } else {
            // If userEmail does not exist, send an appropriate message
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user data", error: error.message });
    }
});

admin.get('/checkStatus/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const userData = await UserData.findOne({ userEmail: email });

        if (!userData) {
            res.status(404).json({ message: "User with the given email does not exist" });
            return;
        }

        if (userData.status === 'Disabled') {
            res.status(403).json({ message: "User is Disabled", status: 'Disabled' });
        } else {
            res.status(200).json({ message: "User is Enabled", status: 'Enabled' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error checking user status", error: error.message });
    }
});

user.get('/getUsername/:email', async (req, res) => {
    try {
        // Extract email from the request parameters
        const email = req.params.email;

        // Find the user by email
        let userData = await UserData.findOne({ userEmail: email });

        if (userData) {
            // If user exists, send back the username
            res.status(200).json({ userName: userData.userName });
        } else {
            // If userEmail does not exist, send an appropriate message
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving user data", error: error.message });
    }
});

admin.get('/getEmails', async (req, res) => {
    try {
        // Find all users except the one with the username "administrator"
        const users = await UserData.find({ userName: { $ne: "administrator" } });

        // Extract the emails from the user data
        const emails = users.map(user => user.userEmail);

        // Return the list of emails
        res.status(200).json({ emails: emails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving user emails", error: error.message });
    }
});

admin.delete('/clearUserData', async (req, res) => {
    try {
        await UserData.deleteMany({});
        res.send('All data in UserData collection has been deleted');
    } catch (err) {
        res.status(500).send('Error deleting data from UserData collection');
    }
});
admin.put('/enableUser/:email', async (req, res) => {
    try {
        // Extract email from the request parameters
        const email = req.params.email;

        // Update the user's status to "Activated"
        const result = await UserData.findOneAndUpdate(
            { userEmail: email },
            { $set: { status: "Enabled" }},
            { new: true } // This option returns the document after update was applied
        );

        if (result) {
            // If user exists and status is updated
            res.status(200).json({ message: "User successfully activated", userData: result });
        } else {
            // If userEmail does not exist
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user data", error: error.message });
    }
});

admin.put('/disableUser/:email', async (req, res) => {
    try {
        // Extract email from the request parameters
        const email = req.params.email;

        // Update the user's status to "Activated"
        const result = await UserData.findOneAndUpdate(
            { userEmail: email },
            { $set: { status: "Disabled" }},
            { new: true } // This option returns the document after update was applied
        );

        if (result) {
            // If user exists and status is updated
            res.status(200).json({ message: "User successfully activated", userData: result });
        } else {
            // If userEmail does not exist
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user data", error: error.message });
    }
});

admin.put('/addSuperAdminUser/:email', async (req, res) => {
    try {
        // Extract email from the request parameters
        const email = req.params.email;

        // Update the user's role to "SuperUser"
        const result = await UserData.findOneAndUpdate(
            { userEmail: email },
            { $set: { role: "SuperUser" }}, // Update role to SuperUser
            { new: true } // This option returns the document after update was applied
        );

        if (result) {
            // If user exists and role is updated
            res.status(200).json({ message: "User role updated to SuperUser successfully", userData: result });
        } else {
            // If userEmail does not exist
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user data", error: error.message });
    }
});

admin.put('/removeSuperAdminUser/:email', async (req, res) => {
    try {
        // Extract email from the request parameters
        const email = req.params.email;

        // Update the user's role to "SuperUser"
        const result = await UserData.findOneAndUpdate(
            { userEmail: email },
            { $set: { role: "User" }}, // Update role to SuperUser
            { new: true } // This option returns the document after update was applied
        );

        if (result) {
            // If user exists and role is updated
            res.status(200).json({ message: "User role updated to SuperUser successfully", userData: result });
        } else {
            // If userEmail does not exist
            res.status(404).json({ message: "User with the given email does not exist" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user data", error: error.message });
    }
});


// Create a schema to define the structure for the Superhero collection
const superheroSchema = new mongoose.Schema({
    id: Number,
    name: String,
    Gender: String,
    'Eye color': String,
    Race: String,
    'Hair color': String,
    Height: Number,
    Publisher: String,
    'Skin color': String,
    Alignment: String,
    Weight: Number
});

// Define a Mongoose schema for superher powers.
const superheroPowerSchema = new mongoose.Schema({
    hero_names: String,
    Agility: String,
    'Accelerated Healing': String,
    'Lantern Power Ring': String,
    'Dimensional Awareness': String,
    'Cold Resistance': String,
    Durability: String,
    Stealth: String,
    'Energy Absorption': String,
    Flight: String,
    'Danger Sense': String,
    'Underwater breathing': String,
    Marksmanship: String,
    'Weapons Master': String,
    'Power Augmentation': String,
    'Animal Attributes': String,
    Longevity: String,
    Intelligence: String,
    'Super Strength': String,
    Cryokinesis: String,
    Telepathy: String,
    'Energy Armor': String,
    'Energy Blasts': String,
    Duplication: String,
    'Size Changing': String,
    'Density Control': String,
    Stamina: String,
    'Astral Travel': String,
    'Audio Control': String,
    Dexterity: String,
    Omnitrix: String,
    'Super Speed': String,
    Possession: String,
    'Animal Oriented Powers': String,
    'Weapon-based Powers': String,
    Electrokinesis: String,
    'Darkforce Manipulation': String,
    'Death Touch': String,
    Teleportation: String,
    'Enhanced Senses': String,
    Telekinesis: String,
    'Energy Beams': String,
    Magic: String,
    Hyperkinesis: String,
    Jump: String,
    Clairvoyance: String,
    'Dimensional Travel': String,
    'Power Sense': String,
    Shapeshifting: String,
    'Peak Human Condition': String,
    Immortality: String,
    Camouflage: String,
    'Element Control': String,
    Phasing: String,
    'Astral Projection': String,
    'Electrical Transport': String,
    'Fire Control': String,
    Projection: String,
    Summoning: String,
    'Enhanced Memory': String,
    Reflexes: String,
    Invulnerability: String,
    'Energy Constructs': String,
    'Force Fields': String,
    'Self-Sustenance': String,
    'Anti-Gravity': String,
    Empathy: String,
    'Power Nullifier': String,
    'Radiation Control': String,
    'Psionic Powers': String,
    Elasticity: String,
    'Substance Secretion': String,
    'Elemental Transmogrification': String,
    'Technopath/Cyberpath': String,
    'Photographic Reflexes': String,
    'Seismic Power': String,
    Animation: String,
    Precognition: String,
    'Mind Control': String,
    'Fire Resistance': String,
    'Power Absorption': String,
    'Enhanced Hearing': String,
    'Nova Force': String,
    Insanity: String,
    Hypnokinesis: String,
    'Animal Control': String,
    'Natural Armor': String,
    Intangibility: String,
    'Enhanced Sight': String,
    'Molecular Manipulation': String,
    'Heat Generation': String,
    Adaptation: String,
    Gliding: String,
    'Power Suit': String,
    'Mind Blast': String,
    'Probability Manipulation': String,
    'Gravity Control': String,
    Regeneration: String,
    'Light Control': String,
    Echolocation: String,
    Levitation: String,
    'Toxin and Disease Control': String,
    Banish: String,
    'Energy Manipulation': String,
    'Heat Resistance': String,
    'Natural Weapons': String,
    'Time Travel': String,
    'Enhanced Smell': String,
    Illusions: String,
    Thirstokinesis: String,
    'Hair Manipulation': String,
    Illumination: String,
    Omnipotent: String,
    Cloaking: String,
    'Changing Armor': String,
    'Power Cosmic': String,
    Biokinesis: String,
    'Water Control': String,
    'Radiation Immunity': String,
    'Vision - Telescopic': String,
    'Toxin and Disease Resistance': String,
    'Spatial Awareness': String,
    'Energy Resistance': String,
    'Telepathy Resistance': String,
    'Molecular Combustion': String,
    Omnilingualism: String,
    'Portal Creation': String,
    Magnetism: String,
    'Mind Control Resistance': String,
    'Plant Control': String,
    Sonar: String,
    'Sonic Scream': String,
    'Time Manipulation': String,
    'Enhanced Touch': String,
    'Magic Resistance': String,
    Invisibility: String,
    'Sub-Mariner': String,
    'Radiation Absorption': String,
    'Intuitive aptitude': String,
    'Vision - Microscopic': String,
    Melting: String,
    'Wind Control': String,
    'Super Breath': String,
    Wallcrawling: String,
    'Vision - Night': String,
    'Vision - Infrared': String,
    'Grim Reaping': String,
    'Matter Absorption': String,
    'The Force': String,
    Resurrection: String,
    Terrakinesis: String,
    'Vision - Heat': String,
    Vitakinesis: String,
    'Radar Sense': String,
    'Qwardian Power Ring': String,
    'Weather Control': String,
    'Vision - X-Ray': String,
    'Vision - Thermal': String,
    'Web Creation': String,
    'Reality Warping': String,
    'Odin Force': String,
    'Symbiote Costume': String,
    'Speed Force': String,
    'Phoenix Force': String,
    'Molecular Dissipation': String,
    'Vision - Cryo': String,
    Omnipresent: String,
    Omniscient: String,
});
// Create a model from the schema to manage Superhero entries
const Superhero = mongoose.model('SuperheroCollection', superheroSchema, 'SuperheroCollection');

// Create a Mongoose model for superheroes using the defined schema.
const SuperheroPowers = mongoose.model('SuperheroPowersCollection', superheroPowerSchema, 'SuperheroPowersCollection');

async function checkConnections() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log("Collections: " + collectionNames);

    // Check and load data for 'superheroes'
    if (!collectionNames.includes('SuperheroCollection')) {
        console.log('Superhero Collection Does Not Exist. Loading Data...');
        await insertSuperheroes('superhero_info.json');
    } else {
        console.log('Superhero Collection Exists.');
    }

    // Check and load data for 'superheropowers'
    if (!collectionNames.includes('SuperheroPowersCollection')) {
        console.log('Superhero Powers Collection Does Not Exist. Loading data...');
        await insertSuperheroPowers('superhero_powers.json');
    } else {
        console.log('Superhero Powers Collection Exists.');
    }
}

// Function to read and insert data from a JSON file.
async function insertSuperheroes(filename) {
    try {
        // Construct the full path to the JSON file using path.join().
        const fullPath = path.join(__dirname, "..", 'jsonfiles', filename);

        const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

        // Insert each superhero into the database using await.
        for (const superhero of data) {
            const newSuperhero = new Superhero(superhero);
            await newSuperhero.save(); // Use await to handle the promise returned by save().
        }

        console.log('Superheroes Inserted Successfully.');

    } catch {
        console.error('Error Saving Superhero:', error);
    }
}

async function insertSuperheroPowers(filename) {
    try {
        // Construct the full path to the JSON file using path.join().
        const fullPath = path.join(__dirname, "..", 'jsonfiles', filename);

        const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

        // Insert each superhero into the database using await.
        for (const superheroPower of data) {
            const supePower = new SuperheroPowers(superheroPower);
            await supePower.save(); // Use await to handle the promise returned by save().
        }

        console.log('Superhero Powers Inserted Successfully.');

    } catch (error) {
        console.error('Error Saving Superhero Powers:', error);
    }
}

// GET request handler for /api/superheroes
router.get('/', async (req, res) => {
    try {
        const superheros = await Superhero.find().select("-_id -__v");
        res.send(superheros);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request handler for /api/superheroes/powers
router.get('/powers', async (req, res) => {
    try {
        const superheroPowers = await SuperheroPowers.find();
        res.send(superheroPowers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request handler for /api/superheroes/publishers
router.get('/publishers', async (req, res) => {
    try {
        const publisherNames = await Superhero.distinct('Publisher');

        // Filter out empty ("") publisher names
        const filteredPublisherNames = publisherNames.filter(name => name !== "");

        res.send(filteredPublisherNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request handler for finding superheroes by information field and pattern
router.get('/match/:field/:pattern/:n', async (req, res) => {
    try {
        const field = req.params.field;
        const pattern = req.params.pattern;
        const n = parseInt(req.params.n); // Parse n to an integer
        let info = "";
        let projection = {
            _id: 0,
            __v: 0
        };
        const rqPattern = new RegExp(`^${pattern}`, 'i'); // Wrap pattern in backticks and fix RegExp syntax

        if (field === 'Height' || field === 'Weight') { // Use strict equality (===)
            info = await Superhero.aggregate([
                { $match: { [field]: { $eq: parseInt(pattern) } } }, // Use $eq for exact match
                { $limit: n }, // Use parsed integer value of n
                { $project: projection }
            ]);
        } else {
            info = await Superhero.aggregate([
                { $match: { [field]: rqPattern } },
                { $limit: n }, // Use parsed integer value of n
                { $project: projection }
            ]);
        }

        if (info.length == 0) {
            return res.status(404).json({ Error: `No Matches Found!` }); // Fix template string
        }

        res.status(200).json(info);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// GET request handler for /api/superheroes/:id
router.get('/:id', async (req, res) => {
    try {
        const superhero = await Superhero.findOne({ id: req.params.id }).select("-_id -__v");

        if (!superhero) {
            return res.status(404).json({ Error: 'Superhero not found' });
        }

        res.send(superhero);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET request handler for /api/superheroes/:name
router.get('/superheroname/:name', async (req, res) => {
    try {
        // Decode the encoded superhero name from the URL
        const decodedName = decodeURIComponent(req.params.name);

        // Create a RegExp for a case-insensitive search that matches any superhero name that starts with the decodedName
        const searchRegex = new RegExp('^' + decodedName, 'i');

        // Search for a superhero by their name
        const superhero = await Superhero.find({ name: searchRegex }).select("-_id -__v");

        if (!superhero) {
            return res.status(404).json({ Error: 'Superhero not found' });
        }

        res.json(superhero);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to get powers by superhero ID
router.get('/:id/powers', async (req, res) => {
    try {
        // Find the superhero by ID
        const superhero = await Superhero.findOne({ id: req.params.id });

        if (!superhero) {
            return res.status(404).json({ message: 'Superhero not found' });
        }

        // Use the superhero's name to find related powers in the SuperheroPowers collection
        const powers = await SuperheroPowers.findOne({ hero_names: superhero.name }).select("-_id -__v").lean();

        if (!powers) {
            return res.status(404).json({ message: 'Powers Not Found For The Given Superhero' });
        }

        // Filter powers to include only those with a value of "True"
        const filteredPowers = {};
        for (const key in powers) {
            if (powers[key] === "True") {
                filteredPowers[key] = "True";
            }
        }

        // Send back the superhero's powers
        res.json(filteredPowers);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const newSuperHeroSchema = new mongoose.Schema({
    "id": Number,
    "name": String,
    "Gender": String,
    "Eye color": String,
    "Race": String,
    "Hair color": String,
    "Height": Number,
    "Publisher": String,
    "Skin color": String,
    "Alignment": String,
    "Weight": Number,
    "Agility": String,
    "Accelerated Healing": String,
    "Lantern Power Ring": String,
    "Dimensional Awareness": String,
    "Cold Resistance": String,
    "Durability": String,
    "Stealth": String,
    "Energy Absorption": String,
    "Flight": String,
    "Danger Sense": String,
    "Underwater breathing": String,
    "Marksmanship": String,
    "Weapons Master": String,
    "Power Augmentation": String,
    "Animal Attributes": String,
    "Longevity": String,
    "Intelligence": String,
    "Super Strength": String,
    "Cryokinesis": String,
    "Telepathy": String,
    "Energy Armor": String,
    "Energy Blasts": String,
    "Duplication": String,
    "Size Changing": String,
    "Density Control": String,
    "Stamina": String,
    "Astral Travel": String,
    "Audio Control": String,
    "Dexterity": String,
    "Omnitrix": String,
    "Super Speed": String,
    "Possession": String,
    "Animal Oriented Powers": String,
    "Weapon-based Powers": String,
    "Electrokinesis": String,
    "Darkforce Manipulation": String,
    "Death Touch": String,
    "Teleportation": String,
    "Enhanced Senses": String,
    "Telekinesis": String,
    "Energy Beams": String,
    "Magic": String,
    "Hyperkinesis": String,
    "Jump": String,
    "Clairvoyance": String,
    "Dimensional Travel": String,
    "Power Sense": String,
    "Shapeshifting": String,
    "Peak Human Condition": String,
    "Immortality": String,
    "Camouflage": String,
    "Element Control": String,
    "Phasing": String,
    "Astral Projection": String,
    "Electrical Transport": String,
    "Fire Control": String,
    "Projection": String,
    "Summoning": String,
    "Enhanced Memory": String,
    "Reflexes": String,
    "Invulnerability": String,
    "Energy Constructs": String,
    "Force Fields": String,
    "Self-Sustenance": String,
    "Anti-Gravity": String,
    "Empathy": String,
    "Power Nullifier": String,
    "Radiation Control": String,
    "Psionic Powers": String,
    "Elasticity": String,
    "Substance Secretion": String,
    "Elemental Transmogrification": String,
    "Technopath/Cyberpath": String,
    "Photographic Reflexes": String,
    "Seismic Power": String,
    "Animation": String,
    "Precognition": String,
    "Mind Control": String,
    "Fire Resistance": String,
    "Power Absorption": String,
    "Enhanced Hearing": String,
    "Nova Force": String,
    "Insanity": String,
    "Hypnokinesis": String,
    "Animal Control": String,
    "Natural Armor": String,
    "Intangibility": String,
    "Enhanced Sight": String,
    "Molecular Manipulation": String,
    "Heat Generation": String,
    "Adaptation": String,
    "Gliding": String,
    "Power Suit": String,
    "Mind Blast": String,
    "Probability Manipulation": String,
    "Gravity Control": String,
    "Regeneration": String,
    "Light Control": String,
    "Echolocation": String,
    "Levitation": String,
    "Toxin and Disease Control": String,
    "Banish": String,
    "Energy Manipulation": String,
    "Heat Resistance": String,
    "Natural Weapons": String,
    "Time Travel": String,
    "Enhanced Smell": String,
    "Illusions": String,
    "Thirstokinesis": String,
    "Hair Manipulation": String,
    "Illumination": String,
    "Omnipotent": String,
    "Cloaking": String,
    "Changing Armor": String,
    "Power Cosmic": String,
    "Biokinesis": String,
    "Water Control": String,
    "Radiation Immunity": String,
    "Vision - Telescopic": String,
    "Toxin and Disease Resistance": String,
    "Spatial Awareness": String,
    "Energy Resistance": String,
    "Telepathy Resistance": String,
    "Molecular Combustion": String,
    "Omnilingualism": String,
    "Portal Creation": String,
    "Magnetism": String,
    "Mind Control Resistance": String,
    "Plant Control": String,
    "Sonar": String,
    "Sonic Scream": String,
    "Time Manipulation": String,
    "Enhanced Touch": String,
    "Magic Resistance": String,
    "Invisibility": String,
    "Sub-Mariner": String,
    "Radiation Absorption": String,
    "Intuitive aptitude": String,
    "Vision - Microscopic": String,
    "Melting": String,
    "Wind Control": String,
    "Super Breath": String,
    "Wallcrawling": String,
    "Vision - Night": String,
    "Vision - Infrared": String,
    "Grim Reaping": String,
    "Matter Absorption": String,
    "The Force": String,
    "Resurrection": String,
    "Terrakinesis": String,
    "Vision - Heat": String,
    "Vitakinesis": String,
    "Radar Sense": String,
    "Qwardian Power Ring": String,
    "Weather Control": String,
    "Vision - X-Ray": String,
    "Vision - Thermal": String,
    "Web Creation": String,
    "Reality Warping": String,
    "Odin Force": String,
    "Symbiote Costume": String,
    "Speed Force": String,
    "Phoenix Force": String,
    "Molecular Dissipation": String,
    "Vision - Cryo": String,
    "Omnipresent": String,
    "Omniscient": String,
})

router.get('/:listName/ids', async (req, res) => {
    const collectionName = req.params.listName;

    try {
        const Model = mongoose.model(collectionName, newSuperHeroSchema, collectionName);
        const superIDs = await Model.find({}).select("id -_id").lean();

        // Extract the "id" field values and convert them to strings
        const idArray = superIDs.map(item => String(item.id));

        res.send(idArray);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/:listName/information', async (req, res) => {
    const collectionName = req.params.listName;

    try {
        const Model = mongoose.model(collectionName, newSuperHeroSchema, collectionName);
        const allHeros = await Model.find({}).select("-_id -__v").lean();

        const allHerosData = [];

        for (const hero of allHeros) {
            const allHeroPowers = {};
            for (const i in hero) {
                if (hero[i] !== "False") {
                    allHeroPowers[i] = hero[i];
                }
            }
            allHerosData.push(allHeroPowers);
        }
        res.send(allHerosData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/collections/names', async (req, res) => {
    const currentCollections = await mongoose.connection.db.listCollections().toArray();
    const allCollections = currentCollections.map((c) => c.name);
    res.json(allCollections);
});

router.route('/:listName')

    .post(async (req, res) => {
        const listName = req.params.listName;

        let collections = await mongoose.connection.db.listCollections().toArray();
        let collectionNames = collections.map((c) => c.name);

        try {
            if (collectionNames.includes(listName)) {

                // The collection already exists, so we inform the client it can't be reused
                console.log(`Collection Name "${listName}" is already in use.`)
                res.status(409).json({ message: `Collection name "${listName}" is already in use, cannot be reused.` });
                return;
            } else {
                // The collection does not exist, so create a new model
                const NewSuperheroList = mongoose.model(listName, newSuperHeroSchema, listName);

                console.log(`Collection "${listName}" - CREATED`);
                res.status(201).json({ message: `Collection "${listName}" has been created.` });

                collections = await mongoose.connection.db.listCollections().toArray();
                collectionNames = collections.map((c) => c.name);

                return;
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })

    .put(async (req, res) => {
        const collectionName = req.params.listName;
        console.log("Updating: " + collectionName);

        try {
            await db.collection(`${collectionName}`).deleteMany({});

            const favID = req.body

            for (let i of favID) {
                const superhero = await Superhero.findOne({ id: i }).lean();
                let powers = await SuperheroPowers.findOne({ hero_names: superhero.name }).select("-_id -__v -heronames").lean();

                try {
                    if (powers == null) {
                        powers = await SuperheroPowers.findOne({ hero_names: "3-D Man" }).select("-_id -__v -hero_names").lean();
                        for (let attr in powers) {
                            powers[attr] = "False";
                        }
                    }
                } catch (errors) {
                    console.log(errors);
                }

                const newHeroList = mongoose.model(`${collectionName}`, newSuperHeroSchema, `${collectionName}`);

                const combinedSuperherInfo = new newHeroList({
                    id: superhero.id,
                    name: superhero.name,
                    Gender: superhero.Gender,
                    'Eye color': superhero['Eye color'],
                    Race: superhero.Race,
                    'Hair color': superhero['Hair color'],
                    Height: superhero.Height,
                    Publisher: superhero.Publisher,
                    'Skin color': superhero['Skin color'],
                    Alignment: superhero.Alignment,
                    Weight: superhero.Weight,
                    Agility: powers.Agility,
                    'Accelerated Healing': powers['Accelerated Healing'],
                    'Lantern Power Ring': powers['Lantern Power Ring'],
                    'Dimensional Awareness': powers['Dimensional Awareness'],
                    'Cold Resistance': powers['Cold Resistance'],
                    Durability: powers.Durability,
                    Stealth: powers.Stealth,
                    'Energy Absorption': powers['Energy Absorption'],
                    Flight: powers.Flight,
                    'Danger Sense': powers['Danger Sense'],
                    'Underwater breathing': powers['Underwater breathing'],
                    Marksmanship: powers.Marksmanship,
                    'Weapons Master': powers['Weapons Master'],
                    'Power Augmentation': powers['Power Augmentation'],
                    'Animal Attributes': powers['Animal Attributes'],
                    Longevity: powers.Longevity,
                    Intelligence: powers.Intelligence,
                    'Super Strength': powers['Super Strength'],
                    Cryokinesis: powers.Cryokinesis,
                    Telepathy: powers.Telepathy,
                    'Energy Armor': powers['Energy Armor'],
                    'Energy Blasts': powers['Energy Blasts'],
                    Duplication: powers.Duplication,
                    'Size Changing': powers['Size Changing'],
                    'Density Control': powers['Density Control'],
                    Stamina: powers.Stamina,
                    'Astral Travel': powers['Astral Travel'],
                    'Audio Control': powers['Audio Control'],
                    Dexterity: powers.Dexterity,
                    Omnitrix: powers.Omnitrix,
                    'Super Speed': powers['Super Speed'],
                    Possession: powers.Possession,
                    'Animal Oriented Powers': powers['Animal Oriented Powers'],
                    'Weapon-based Powers': powers['Weapon-based Powers'],
                    Electrokinesis: powers.Electrokinesis,
                    'Darkforce Manipulation': powers['Darkforce Manipulation'],
                    'Death Touch': powers['Death Touch'],
                    Teleportation: powers.Teleportation,
                    'Enhanced Senses': powers['Enhanced Senses'],
                    Telekinesis: powers.Telekinesis,
                    'Energy Beams': powers['Energy Beams'],
                    Magic: powers.Magic,
                    Hyperkinesis: powers.Hyperkinesis,
                    Jump: powers.Jump,
                    Clairvoyance: powers.Clairvoyance,
                    'Dimensional Travel': powers['Dimensional Travel'],
                    'Power Sense': powers['Power Sense'],
                    Shapeshifting: powers.Shapeshifting,
                    'Peak Human Condition': powers['Peak Human Condition'],
                    Immortality: powers.Immortality,
                    Camouflage: powers.Camouflage,
                    'Element Control': powers['Element Control'],
                    Phasing: powers.Phasing,
                    'Astral Projection': powers['Astral Projection'],
                    'Electrical Transport': powers['Electrical Transport'],
                    'Fire Control': powers['Fire Control'],
                    Projection: powers.Projection,
                    Summoning: powers.Summoning,
                    'Enhanced Memory': powers['Enhanced Memory'],
                    Reflexes: powers.Reflexes,
                    Invulnerability: powers.Invulnerability,
                    'Energy Constructs': powers['Energy Constructs'],
                    'Force Fields': powers['Force Fields'],
                    'Self-Sustenance': powers['Self-Sustenance'],
                    'Anti-Gravity': powers['Anti-Gravity'],
                    Empathy: powers.Empathy,
                    'Power Nullifier': powers['Power Nullifier'],
                    'Radiation Control': powers['Radiation Control'],
                    'Psionic Powers': powers['Psionic Powers'],
                    Elasticity: powers.Elasticity,
                    'Substance Secretion': powers['Substance Secretion'],
                    'Elemental Transmogrification': powers['Elemental Transmogrification'],
                    'Technopath/Cyberpath': powers['Technopath/Cyberpath'],
                    'Photographic Reflexes': powers['Photographic Reflexes'],
                    'Seismic Power': powers['Seismic Power'],
                    Animation: powers.Animation,
                    Precognition: powers.Precognition,
                    'Mind Control': powers['Mind Control'],
                    'Fire Resistance': powers['Fire Resistance'],
                    'Power Absorption': powers['Power Absorption'],
                    'Enhanced Hearing': powers['Enhanced Hearing'],
                    'Nova Force': powers['Nova Force'],
                    Insanity: powers.Insanity,
                    Hypnokinesis: powers.Hypnokinesis,
                    'Animal Control': powers['Animal Control'],
                    'Natural Armor': powers['Natural Armor'],
                    Intangibility: powers.Intangibility,
                    'Enhanced Sight': powers['Enhanced Sight'],
                    'Molecular Manipulation': powers['Molecular Manipulation'],
                    'Heat Generation': powers['Heat Generation'],
                    Adaptation: powers.Adaptation,
                    Gliding: powers.Gliding,
                    'Power Suit': powers['Power Suit'],
                    'Mind Blast': powers['Mind Blast'],
                    'Probability Manipulation': powers['Probability Manipulation'],
                    'Gravity Control': powers['Gravity Control'],
                    Regeneration: powers.Regeneration,
                    'Light Control': powers['Light Control'],
                    Echolocation: powers.Echolocation,
                    Levitation: powers.Levitation,
                    'Toxin and Disease Control': powers['Toxin and Disease Control'],
                    Banish: powers.Banish,
                    'Energy Manipulation': powers['Energy Manipulation'],
                    'Heat Resistance': powers['Heat Resistance'],
                    'Natural Weapons': powers['Natural Weapons'],
                    'Time Travel': powers['Time Travel'],
                    'Enhanced Smell': powers['Enhanced Smell'],
                    Illusions: powers.Illusions,
                    Thirstokinesis: powers.Thirstokinesis,
                    'Hair Manipulation': powers['Hair Manipulation'],
                    Illumination: powers.Illumination,
                    Omnipotent: powers.Omnipotent,
                    Cloaking: powers.Cloaking,
                    'Changing Armor': powers['Changing Armor'],
                    'Power Cosmic': powers['Power Cosmic'],
                    Biokinesis: powers.Biokinesis,
                    'Water Control': powers['Water Control'],
                    'Radiation Immunity': powers['Radiation Immunity'],
                    'Vision - Telescopic': powers['Vision - Telescopic'],
                    'Toxin and Disease Resistance': powers['Toxin and Disease Resistance'],
                    'Spatial Awareness': powers['Spatial Awareness'],
                    'Energy Resistance': powers['Energy Resistance'],
                    'Telepathy Resistance': powers['Telepathy Resistance'],
                    'Molecular Combustion': powers['Molecular Combustion'],
                    Omnilingualism: powers.Omnilingualism,
                    'Portal Creation': powers['Portal Creation'],
                    Magnetism: powers.Magnetism,
                    'Mind Control Resistance': powers['Mind Control Resistance'],
                    'Plant Control': powers['Plant Control'],
                    Sonar: powers.Sonar,
                    'Sonic Scream': powers['Sonic Scream'],
                    'Time Manipulation': powers['Time Manipulation'],
                    'Enhanced Touch': powers['Enhanced Touch'],
                    'Magic Resistance': powers['Magic Resistance'],
                    Invisibility: powers.Invisibility,
                    'Sub-Mariner': powers['Sub-Mariner'],
                    'Radiation Absorption': powers['Radiation Absorption'],
                    'Intuitive aptitude': powers['Intuitive aptitude'],
                    'Vision - Microscopic': powers['Vision - Microscopic'],
                    Melting: powers.Melting,
                    'Wind Control': powers['Wind Control'],
                    'Super Breath': powers['Super Breath'],
                    Wallcrawling: powers.Wallcrawling,
                    'Vision - Night': powers['Vision - Night'],
                    'Vision - Infrared': powers['Vision - Infrared'],
                    'Grim Reaping': powers['Grim Reaping'],
                    'Matter Absorption': powers['Matter Absorption'],
                    'The Force': powers['The Force'],
                    Resurrection: powers.Resurrection,
                    Terrakinesis: powers.Terrakinesis,
                    'Vision - Heat': powers['Vision - Heat'],
                    Vitakinesis: powers.Vitakinesis,
                    'Radar Sense': powers['Radar Sense'],
                    'Qwardian Power Ring': powers['Qwardian Power Ring'],
                    'Weather Control': powers['Weather Control'],
                    'Vision - X-Ray': powers['Vision - X-Ray'],
                    'Vision - Thermal': powers['Vision - Thermal'],
                    'Web Creation': powers['Web Creation'],
                    'Reality Warping': powers['Reality Warping'],
                    'Odin Force': powers['Odin Force'],
                    'Symbiote Costume': powers['Symbiote Costume'],
                    'Speed Force': powers['Speed Force'],
                    'Phoenix Force': powers['Phoenix Force'],
                    'Molecular Dissipation': powers['Molecular Dissipation'],
                    'Vision - Cryo': powers['Vision - Cryo'],
                    Omnipresent: powers.Omnipresent,
                    Omniscient: powers.Omniscient,
                });

                combinedSuperherInfo.save();
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    })

    .delete(async (req, res) => {
        const listName = req.params.listName;

        let collections = await mongoose.connection.db.listCollections().toArray();
        let existingCollections = collections.map((c) => c.name);

        try {
            // Check if the desired collection name exists
            if (existingCollections.includes(listName)) {
                // Use Mongoose's connection object to drop the collection
                await mongoose.connection.dropCollection(listName);

                console.log("Collection: " + listName + " - DELETED")
                res.status(200).json({ message: `Collection "${listName}" has been deleted.` });

                collections = await mongoose.connection.db.listCollections().toArray();
                existingCollections = collections.map((c) => c.name);
                console.log(existingCollections);

            } else {
                res.status(404).json({ message: `Collection "${listName}" does not exist.` });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
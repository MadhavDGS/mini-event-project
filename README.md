# mini event platform - mern stack

full stack event management app built with mongodb, express, react, and node. users can create events, rsvp to events, and manage attendance with proper concurrency handling.

## live demo

- frontend: https://mini-event-project-eta.vercel.app
- backend api: https://mini-event-project.onrender.com

Also used uptimebot so render server doesnt sleep 

## features implemented

### core features
- user authentication with jwt (register and login)
- event management (create, view, edit, delete)
- image upload using cloudinary
- rsvp system with capacity enforcement
- concurrency handling using mongodb transactions
- authorization (users can only edit/delete own events)
- responsive design with daisyui
- search functionality (by title, location, description)
- user dashboard filters (all events, my events, attending)
- category filtering (general, music, sports, tech, food, art, business, education)
- date range filtering (from/to dates)

### bonus features
- ai integration using google gemini api
- dark mode toggle with persistent storage
- form validation and error handling

## tech stack

**frontend:**
- react 18 with vite
- react router dom
- axios for api calls
- tailwind css with daisyui
- context api for state management

**backend:**
- nodejs with express
- mongodb with mongoose
- jwt authentication
- cloudinary for images
- google gemini ai

**database:**
- mongodb atlas




### 2. backend setup

```bash
cd server
npm install
```

create `.env` file in server directory:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key_optional
```

start server:

```bash
npm run dev
```

server runs on http://localhost:5001

### 3. frontend setup

open new terminal:

```bash
cd client
npm install
npm run dev
```

react app runs on http://localhost:5173

### 4. open browser

go to http://localhost:5173

## RSVP Concurrency and Capacity Handling

### the problem

when multiple users try to rsvp for the last spot at same time, race condition happens. system might allow more people than capacity. heres how:

1. user a checks: "is there space?" sees yes (50/50)
2. user b checks same time: "is there space?" also sees yes (50/50) 
3. user a joins becomes (51/50) wrong
4. user b joins becomes (52/50) even worse

### solution: mongodb transactions

i used mongodb sessions and transactions to make everything atomic. all checks and updates happen together as one operation, no one can interfere in between.

#### code implementation

**file**: `server/src/routes/rsvp.js`

```javascript
router.post('/:id/join', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const eventId = req.params.id;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.toString() === userId.toString()
    );
    
    if (alreadyRegistered) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    if (event.attendees.length >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Event is full' });
    }
    
    event.attendees.push(userId);
    await event.save({ session });
    
    await session.commitTransaction();
    
    res.json({ message: 'Successfully joined event', event });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error joining event' });
  } finally {
    session.endSession();
  }
});
```

### how it works

1. **start session** - create mongodb session for transaction
2. **lock document** - `.session(session)` locks the event so no one else can modify it
3. **check everything** - check if event exists, user already joined, space available
4. **update** - if all good, add user to attendees
5. **commit or abort** - if success commit transaction, if fail abort and nothing saves
6. **cleanup** - always close session at end

### why this prevents race conditions

- **isolation** - transaction isolates checks and updates from other requests
- **locking** - mongodb locks document so only one transaction modifies at a time
- **atomicity** - everything succeeds together or fails together, no in-between
- **consistency** - database stays correct, never goes over capacity

### testing

# login with these detaiils to test

sreemadhav.reply@gmail
Pass: 123456

to test:
1. open multiple browser tabs
2. create different users in each
3. make event with capacity 1
4. try rsvp from all tabs at same time
5. only one succeeds, others get "event is full"

## project structure

```
mini-event-platform/
├── client/                 # react frontend
│   ├── src/
│   │   ├── components/    # reusable components
│   │   ├── context/       # auth context
│   │   ├── pages/         # all pages
│   │   └── App.jsx        # main app
│   └── package.json
├── server/                 # express backend
│   ├── src/
│   │   ├── config/        # db connection
│   │   ├── middleware/    # auth & upload
│   │   ├── models/        # mongoose models
│   │   └── routes/        # api routes
│   └── package.json
└── README.md
```

## api endpoints

### auth
- POST /api/auth/register - register new user
- POST /api/auth/login - login user
- GET /api/auth/me - get current user (protected)

### events
- GET /api/events - get all events
- GET /api/events/:id - get single event
- POST /api/events - create event (protected)
- PUT /api/events/:id - update event (protected, owner only)
- DELETE /api/events/:id - delete event (protected, owner only)

### rsvp
- POST /api/rsvp/:id/join - join event (protected)
- POST /api/rsvp/:id/leave - leave event (protected)

### upload
- POST /api/upload - upload image (protected)

### ai
- POST /api/ai/enhance - enhance description (protected)

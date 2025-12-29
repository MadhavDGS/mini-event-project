import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/join', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const eventId = req.params.id;
    const userId = req.user._id;
    
    // lock event for this transaction
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
    
    await event.populate('attendees', 'name email');
    await event.populate('createdBy', 'name email');
    
    res.json({ message: 'Successfully joined event', event });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error joining event', error: error.message });
  } finally {
    session.endSession();
  }
});

router.post('/:id/leave', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;
    
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { attendees: userId } },
      { new: true }
    )
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Successfully left event', event });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving event', error: error.message });
  }
});

export default router;

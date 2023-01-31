const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
// const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy, user) {
	try {
		const criteria = _buildCriteria(filterBy, user)
		const collection = await dbService.getCollection('note')
		let notes = await collection.find(criteria).toArray()
		return notes
	} catch (err) {
		logger.error('Cannot find notes', err)
		throw err
	}
}

async function getById(noteId, user) {
	try {
		const notes = await _getNotes(user)
		const noteList = notes[0].noteList

		const note = noteList.find((note) => note._id === noteId)

		// const note = await noteList.findOne({ _id: noteId })
		// const notes = await collection.find({ userId: ObjectId(user._id) }).toArray()
		// const noteList = await collection.find('noteList').toArray()
		// const collection = await dbService.getCollection('note')
		// const note = await collection.findOne({ _id: noteId })
		return note
	} catch (err) {
		logger.error(`While finding note ${noteId}`, err)
		throw err
	}
}

async function add(note, user) {
	const notes = await _getNotes(user)
	const noteList = notes[0].noteList
	try {
		noteList.unshift(note)
		_updateList(notes)
		return note
	} catch (err) {
		logger.error('Cannot insert note', err)
		throw err
	}
}

async function update(note, user) {
	const notes = await _getNotes(user)
	const noteList = notes[0].noteList
	try {
		const idx = noteList.findIndex((n) => n._id === note._id)
		noteList.splice(idx, 1, note)
		await _updateList(notes)
		return note
	} catch (err) {
		logger.error(`Cannot update toy ${note._id}`, err)
		throw err
	}
}

async function remove(noteId, user) {
	const notes = await _getNotes(user)
	const noteList = notes[0].noteList
	try {
		const idx = noteList.findIndex((n) => n._id === noteId)
		noteList.splice(idx, 1)
		_updateList(notes)

		// const collection = await dbService.getCollection('note')
		// await collection.deleteOne({ _id: ObjectId(noteId) })
		return noteId
	} catch (err) {
		logger.error(`Cannot remove note ${noteId}`, err)
		throw err
	}
}

async function _updateList(notes) {
	let id = ObjectId(notes[0]._id)
	delete notes[0]._id
	// let userId = ObjectId(notes[0].userId)
	// delete notes[0].userId

	const noteList = notes[0].noteList
	const collection = await dbService.getCollection('note')
	await collection.updateOne({ _id: id }, { $set: { noteList } })
}

async function _getNotes(user) {
	const collection = await dbService.getCollection('note')
	const notes = await collection.find({ userId: ObjectId(user._id) }).toArray()
	return notes
}

function _buildCriteria(filterBy, user) {
	const criteria = {}
	if (user) criteria.userId = ObjectId(user._id)
	return criteria
}

module.exports = {
	query,
	getById,
	add,
	update,
	remove,
}

// async function query(filterBy = {}) {
// 	try {
// 		const criteria = _buildCriteria(filterBy)
// 		const collection = await dbService.getCollection('note')
// 		// const reviews = await collection.find(criteria).toArray()
// 		var notes = await collection
// 			.aggregate([
// 				{
// 					$match: criteria,
// 				},
// 				{
// 					$lookup: {
// 						localField: 'byUserId',
// 						from: 'user',
// 						foreignField: '_id',
// 						as: 'byUser',
// 					},
// 				},
// 				{
// 					$unwind: '$byUser',
// 				},
// 				{
// 					$lookup: {
// 						localField: 'aboutUserId',
// 						from: 'user',
// 						foreignField: '_id',
// 						as: 'aboutUser',
// 					},
// 				},
// 				{
// 					$unwind: '$aboutUser',
// 				},
// 			])
// 			.toArray()
// 		reviews = reviews.map((review) => {
// 			review.byUser = {
// 				_id: review.byUser._id,
// 				fullname: review.byUser.fullname,
// 			}
// 			review.aboutUser = {
// 				_id: review.aboutUser._id,
// 				fullname: review.aboutUser.fullname,
// 			}
// 			delete review.byUserId
// 			delete review.aboutUserId
// 			return review
// 		})

// 		return reviews
// 	} catch (err) {
// 		logger.error('cannot find reviews', err)
// 		throw err
// 	}
// }

// async function remove(reviewId) {
// 	try {
// 		const store = asyncLocalStorage.getStore()
// 		const { loggedinUser } = store
// 		const collection = await dbService.getCollection('review')
// 		// remove only if user is owner/admin
// 		const criteria = { _id: ObjectId(reviewId) }
// 		if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
// 		const { deletedCount } = await collection.deleteOne(criteria)
// 		return deletedCount
// 	} catch (err) {
// 		logger.error(`cannot remove review ${reviewId}`, err)
// 		throw err
// 	}
// }

// async function add(review) {
// 	try {
// 		const reviewToAdd = {
// 			byUserId: ObjectId(review.byUserId),
// 			aboutUserId: ObjectId(review.aboutUserId),
// 			txt: review.txt,
// 		}
// 		const collection = await dbService.getCollection('review')
// 		await collection.insertOne(reviewToAdd)
// 		return reviewToAdd
// 	} catch (err) {
// 		logger.error('cannot insert review', err)
// 		throw err
// 	}
// }

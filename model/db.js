var MongoClient = require('mongodb').MongoClient;

class Content {
	constructor (dbName) {
		this.dbName = dbName;
		this.reject = null;
	}
	setkey (key, val) {
		this[key] = val;
	}
	
	setReject (reject) {
		this.reject = reject;
	}
	delReject () {
		this.reject = null;
	}
	_connect (callback) {
		const that = this;
		MongoClient.connect('mongodb://127.0.0.1:27017/', {
			useUnifiedTopology: true     //这个即是报的警告
		}, (err, db) => {
			var dbo = db.db(this.dbName);
			if (err) {
				(that.reject || reject)(err);
				throw err;
			}
			callback(db, dbo);
		})
	}
	/*findSort (collectionName, condition, args={}, sortArgs) {
		const that = this;
		return new Promise((resolve, reject) => {
			that._connect(function (db, dbo) {
				
				dbo.collection(collectionName).find(condition).sort(sortArgs).toArray(function(err, result) {
					if (err) {
						(reject || that.reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
			})
		})
	}*/
	count (collectionName, condition={}) {
		const that = this;
		return new Promise((resolve, reject) => {
			that._connect(function (db, dbo) {
				
				dbo.collection(collectionName).find(condition).count(function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
			})
		})
	}
	find (collectionName, condition={}, args={}, sortArgs={_id: -1}) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				var pageSize = parseInt(args.pageSize) || 0;
				var pageIndex = parseInt(args.pageIndex || 1);
				var skipnumber = pageSize * (pageIndex - 1);
				var limitnumber = pageSize

				dbo.collection(collectionName).find(condition).sort(sortArgs).skip(skipnumber).limit(limitnumber).toArray(function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
				
			});
		})
	}
	insertOne (collectionName, data) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				dbo.collection(collectionName).insertOne(data, function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close();
				})
			})
		})
	}
	insertMany (collectionName, data) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				dbo.collection(collectionName).insertMany(data, function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close();
				})
			})
		})
	}
	deleteMany (collectionName, condition) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				dbo.collection(collectionName).deleteMany(condition, function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close();
				})
			})
		})
	}
	updateMany (collectionName, josn1, josn2) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				dbo.collection(collectionName).updateMany(josn1, josn2, function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close();
				})
			})
		})
	}
	updateOne (collectionName, josn1, josn2) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				dbo.collection(collectionName).updateOne(josn1, josn2, function(err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close();
				})
			})
		})
	}
	findOneAndUpdate (collectionName, c1, c2, c3) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				// result还是之前未修改的
				dbo.collection(collectionName).findOneAndUpdate(c1, c2, c3, function (err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
			})
		})
	}
	findOneAndDelete (collectionName, c1, c2, c3) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				// result还是之前未修改的
				dbo.collection(collectionName).findOneAndDelete(c1, c2, function (err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
			})
		})
	}
	aggregate (collectionName, condition) {
		const that = this;
		return new Promise((resolve, reject) => {
			this._connect(function(db, dbo) {
				
				// result还是之前未修改的
				dbo.collection(collectionName).aggregate(condition).toArray(function (err, result) {
					if (err) {
						(that.reject || reject)(err);
					} else {
						resolve(result);
					}
					db.close()
				});
			})
		})
	}
}

module.exports = Content;



const user$project = {
    _id: 1,
    name: 1,
    face: 1
}
exports.user$project = user$project;
exports.replyGetUsersql = {
	$lookup: {
	    from: "users",
	    // localField: "_id",
	    // foreignField: "commit_id",
	    let: { user_id: "$user_id", to_user_id: "$to_user_id" },
	    pipeline: [
	        { $match: {
	        
	            $expr: {
	                $or: [
	                    {
	                        $eq: ['$_id', '$$user_id']
	                    },
	                    {
	                        $eq: ['$_id', '$$to_user_id']
	                    }
	                ]
	            }
	            
	        } },
	        { $project: user$project }
	    ],
	    as: "user"
	}
}

exports.getSiteCollectSql = user_id => {
	return {
		$lookup: {
			from: "collections",
            // localField: "_id",
            // foreignField: "commit_id",
            let: { s_id: "$_id" },
            pipeline: [
                { 
               		$match: {
               			$expr: {
                            $and:[
                                { $eq: ['$user_id', user_id] },
                            	{ $eq: ['$$s_id', '$site_id'] }
	                        ] 
	                    }
               		} 
               },
            ],
            as: "collection"
		}
	}
}
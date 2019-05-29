/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const Comment= sequelize.define('comments', {
		id: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		postId: {
			type: DataTypes.INTEGER(10),
			allowNull: false
		},
		authorId: {
			type: DataTypes.INTEGER(10),
			allowNull: false
		},
		authorName: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	},{timestamps: false}); 
	Comment.associate = function (models) {
        Comment.belongsTo(models.User,{
            foreignKey:'authorId',
            onDelete:'CASCADE',
        });
	};
	
	return Comment;
};

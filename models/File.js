module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    fileId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    folderId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'files', // Specify the correct table name here
    timestamps: false
  });

  File.associate = (models) => {
    File.belongsTo(models.Folder, { foreignKey: 'folderId', as: 'folder' });
  };

  return File;
};
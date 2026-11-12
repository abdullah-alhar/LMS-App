const Course = require('../models/Course');
const Material = require('../models/Material');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { canManage, canView } = require('../utils/permissions');

const youtubePattern = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
const linkPattern = /^https?:\/\/\S+$/;

// POST /api/courses/:id/materials
const addMaterial = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!canManage(course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can add materials' });
  }

  const { title, type, url } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  const data = { course: course._id, title, type, uploadedBy: req.user._id };

  if (type === 'file') {
    if (!req.file) return res.status(400).json({ message: 'Please attach a file' });
    const result = await uploadToCloudinary(req.file.buffer, `lms/${course.code}`);
    data.url = result.secure_url;
    data.publicId = result.public_id;
    data.fileName = req.file.originalname;
  } else if (type === 'video') {
    if (!youtubePattern.test(url || '')) {
      return res.status(400).json({ message: 'Please give a valid YouTube link' });
    }
    data.url = url;
  } else if (type === 'link') {
    if (!linkPattern.test(url || '')) {
      return res.status(400).json({ message: 'Please give a valid link starting with http' });
    }
    data.url = url;
  }

  const material = await Material.create(data);
  res.status(201).json(material);
};

// GET /api/courses/:id/materials
const getMaterials = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!(await canView(course, req.user))) {
    return res.status(403).json({ message: 'Enrol in this course to see its materials' });
  }

  const materials = await Material.find({ course: course._id }).sort({ createdAt: 1 });
  res.status(200).json(materials);
};

// DELETE /api/courses/:id/materials/:materialId
const deleteMaterial = async (req, res) => {
  const material = await Material.findOne({ _id: req.params.materialId, course: req.params.id })
    .populate('course');
  if (!material) return res.status(404).json({ message: 'Material not found' });
  if (!canManage(material.course, req.user)) {
    return res.status(403).json({ message: 'Only the course lecturer can delete materials' });
  }

  if (material.publicId) {
    await cloudinary.uploader.destroy(material.publicId, { resource_type: 'raw' });
  }
  await material.deleteOne();
  res.status(200).json({ message: 'Material deleted' });
};

module.exports = { addMaterial, getMaterials, deleteMaterial };
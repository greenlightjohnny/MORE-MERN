exports.delete = async function (req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    console.log(deletedUser);
    res.status(200).json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

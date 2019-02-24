
module.exports = async (ctl) => {
  const { STAGE = 'local' } = process.env;
  let stage = STAGE.toLowerCase();
  return (setStage) => {
    if (setStage) {
      stage = setStage.toLowerCase();
    }
    return stage;
  }
}
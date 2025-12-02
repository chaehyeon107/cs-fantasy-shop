const Item = require("../models/item.model");

//
// 관리자 전용 - 아이템 생성
//
exports.createItem = async (data) => {
  const newItem = await Item.create(data);
  return newItem;
};

//
// 전체 아이템 조회
//
exports.getItems = async () => {
  return await Item.find().sort({ createdAt: -1 });
};

//
// 아이템 수정
//
exports.updateItem = async (id, data) => {
  const updated = await Item.findByIdAndUpdate(id, data, {
    new: true,     // 수정된 값 반환
    runValidators: true
  });

  return updated;
};

//
// 아이템 삭제
//
exports.deleteItem = async (id) => {
  const deleted = await Item.findByIdAndDelete(id);
  return deleted;
};

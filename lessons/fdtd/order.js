/* Previous and Next follow the study order of Part A, not the chapter order. Loaded after every Part A lesson. */
(function () {
  const ids = FD.ORDER_A.filter(id => findLesson(id));
  ids.forEach((id, i) => {
    const l = findLesson(id).l;
    if (i > 0) l.prevId = ids[i - 1];
    if (i < ids.length - 1) l.nextId = ids[i + 1];
  });
  const last = ids.length && findLesson(ids[ids.length - 1]);
  if (last && findLesson("thesis-lec-l4")) last.l.nextId = "thesis-lec-l4";
})();

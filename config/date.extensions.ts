interface Date {
  format(): string;
  addHours(hours:number): Date;
}

Date.prototype.format = function () {
  return formatDate(this);
};

Date.prototype.addHours = function (hours:number) {
  return addHours(this, hours);
};

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}

function addHours(date: Date, h:number) {
  date.setTime(date.getTime() + (h*60*60*1000));
  return date;
}

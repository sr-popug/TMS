const months = [
  'Января',
  'Февраля',
  'Марта',
  'Апреля',
  'Мая',
  'Июня',
  'Июля',
  'Августа',
  'Сентября',
  'Октября',
  'Ноября',
  'Декабря',
];

export default function getDate(date: Date) {
  let normalDate = '';
  normalDate += `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  return normalDate;
}

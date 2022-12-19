export const getMonthString = (value) => {
  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  return MONTHS[Number(value) - 1];
};

export function downloadURL(url, fileName) {
  const link = document.createElement('a');

  document.body.appendChild(link);
  link.href = url;
  link.setAttribute('download', fileName);
  link.click();
  document.body.removeChild(link);
}

export const validateEmail = (email) => {
  // eslint-disable-next-line no-useless-escape
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  } else {
    return false;
  }
};

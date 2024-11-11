
function addCheckboxes(items) {
  const container = document.getElementById('regionSelectForm');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
}
  items.forEach(item => {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = item;
    checkbox.value = item;

    const span = document.createElement('span');
    span.textContent = item;

    label.appendChild(checkbox);
    label.appendChild(span);

    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(document.createElement('hr'));
    container.appendChild(checkboxContainer);
  });
}

function init() {
  // addCheckboxes(fruits);
  window.lookUpTable = {nodata : "非拍摄照片"};
  window.lookUpSet = new Set();
  window.globalImageContext = []
  window.currentAvailableRegions = new Set()
  window.currentShowImages = [];
}
currentIndex = 0


function readCheckboxValues() {
  currentShowImages = []
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
  console.log(selectedValues);
  for (var i = 0; i < globalImageContext.length; i++) {
    if(typeof globalImageContext[i].location != typeof "string") {
      loca = JSON.stringify(globalImageContext[i].location)
    } else {
      loca = globalImageContext[i].location
    }
    position = lookUpTable[loca]
    console.log(`Current position ${position}`)
    if (position != undefined && selectedValues.includes(position)) {
      currentShowImages.push(globalImageContext[i])
    }
  }
  setToFirstGraph();
}

function setToFirstGraph () {
  currentIndex = 0;
  nextImage();
}

function readSelectDates() {
  console.log("readSelectDates");
  currentShowImages = []
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  updateCurrentShowImagesByDate(startDate, endDate);
  console.log(startDate, endDate);

  for (var i = 0; i < globalImageContext.length; i++) {
    if (globalImageContext[i].time >= startDate && globalImageContext[i].time <= endDate) {
      console.log(globalImageContext[i].time);
      currentShowImages.push(globalImageContext[i])
    }
  }
  setToFirstGraph();
}


function loadGraphs(link) {
  console.log(link);

}

function updateCurrentShowImagesByDate(startDate,endDate) {
  window.currentShowImages = []
  for (let i = 0; i < globalImageContext.length; i++) {
    if(globalImageContext[i].date >= startDate && globalImageContext[i].date <= endDate) {
      window.currentShowImages.push(globalImageContext[i]);
    }
  }
  refreashImageContainer();
}

function previousImage() {
  currentImageIndex = document.getElementById("currentImageIndex")
  if(currentIndex > 1) {
    currentIndex = currentIndex - 1
  }
  currentImageIndex.textContent = `${currentIndex}/${window.currentShowImages.length}`
  refreashCurrentImage();
}

function nextImage() {
  currentImageIndex = document.getElementById("currentImageIndex")
  if(currentIndex < currentShowImages.length) {
    currentIndex = currentIndex + 1
  }
  currentImageIndex.textContent = `${currentIndex}/${window.currentShowImages.length}`
  refreashCurrentImage();
}
function debug_load_image() {
  currentShowImages = globalImageContext
  setToFirstGraph()
}
function refreashImageContainer() {
  
}

function updateCurrentShowImagesByRegions(regions) {
  
}

function refreashCurrentAvailableRegions() {
  console.log("Refreash Available Regions")
  for(let i = 0; i < globalImageContext.length; i++) {
    if(typeof globalImageContext[i].location != typeof "string") {
      currentAvailableRegions.add(lookUpTable[JSON.stringify(globalImageContext[i].location)])
    }
    else {
      currentAvailableRegions.add(lookUpTable[globalImageContext[i].location])
    }
  }
  console.log(currentAvailableRegions)
  addCheckboxes(currentAvailableRegions)
}

function refreashCurrentImage() {
  nowShowing = document.getElementById("currentShowing")
  nowShowing.src = window.currentShowImages[currentIndex - 1].dataUrl
}


function handleFileSelect(event) {
  window.globalImageContext = []
  // console.log(typeof EXIF)
  val = 0
  valx = 0
  const files = event.target.files;
  // console.log(files);
  max = files.length
  label = document.getElementById("progressLabel")
  label.textContent = "正在准备图片"
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // console.log(file)
    const reader = new FileReader();
    reader.readAsDataURL(file);
    setTimeout(() => {
      valx = valx+ 1
      updateProgressBar(valx, max, `正在准备第${valx}张图片`)
    }, getRandomIntInclusive(0, 100));

    reader.onload = function(e) {
      getExifData(file).then(data => {
        // console.log(data);
        GPSLatitude = convertToDegrees(data.GPSLatitude);
        GPSLongitude = convertToDegrees(data.GPSLongitude);
        
        if(i == window.globalImageContext.length - 1){
          console.log("正在载入地址数据")
          setTimeout(() => {
            window.currentAvailableRegions = new Set()
            addCheckboxes([])
            refreashCurrentAvailableRegions()
            console.log(lookUpTable)
          }, 1000);
        }
        val += 1;
        updateProgressBar(val, max, `加载第${a + 1}个文件`);
        if (GPSLatitude && GPSLongitude) {
            loca = {lng: GPSLatitude, lat: GPSLongitude}
            if(window.lookUpSet.has(JSON.stringify(loca))) {
              console.log("Cache hit!")
              window.globalImageContext.push({
                name: file.name,
                dataUrl: e.target.result,
                location: {
                  lng: GPSLongitude,
                  lat: GPSLatitude
                },
                time: convertTimeToDate(data.DateTime)
              });
              return;
            } else {
              window.lookUpSet.add(JSON.stringify(loca));
              parseGPS(GPSLatitude, GPSLongitude)
            }
          window.globalImageContext.push({
            name: file.name,
            dataUrl: e.target.result,
            location: {
              lng: GPSLongitude,
              lat: GPSLatitude
            },
            time: convertTimeToDate(data.DateTime)
          }); // 将图片数据存储在全局上下文中
          
        } else {
          
          // console.log(convertMillisecondsToDate(file.lastModified));
          window.globalImageContext.push({
            name: file.name,
            dataUrl: e.target.result,
            location: 'nodata',
            time: convertMillisecondsToDate(file.lastModified)
          }); // 将图片数据存储在全局上下文中
        }

        
      }).catch(err => {
      })
    }
    
  }


  // refreashCurrentAvailableRegions();
  // 刷新当前可用的区域
}

function getExifData(imageElement) {
  return new Promise((resolve, reject) => {
      EXIF.getData(imageElement, function() {
          const data = EXIF.getAllTags(this);
          resolve(data);
      });
  });
}

function convertMillisecondsToDate(ms) {
  const date = new Date(ms);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function convertTimeToDate(time) {
  return time.replace(/:/g, '-').split(' ')[0];
}


function convertToDegrees(LongLati) {
  if(LongLati == undefined) return undefined;
  const degrees = LongLati[0];
  const minutes = LongLati[1] / 60;
  const seconds = LongLati[2] / 3600;
  longlati = parseFloat((degrees + minutes + seconds).toFixed(1))
  // console.log(longlati)
  return longlati;
}


function updateProgressBar(value, max, textx) {

  a = value
  value = value / max * 100;
  const progressBar = document.getElementById('progressBar'); // 获取进度条元素
  const progressLabel = document.getElementById('progressLabel'); // 获取进度条元素
  progressBar.value = value;
  progressLabel.textContent = textx;
}
ak = "QXEefnfZlZA5iTlpr1VNfiQy7FDNzBKP"
function parseGPS(latitude, longitude) {
  console.log("parsing")
  var url = `https://api.map.baidu.com/reverse_geocoding/v3/?ak=${ak}&output=json&coordtype=wgs84ll&location=${latitude},${longitude}`
  try {
    // const response = await axios.get(url);
    // return response.data
    fetchJSONP(url)

  } catch (error) {
    console.error('Error:', error);
  }
}
handleResponse = function (data) {
  console.log("Callback called")
  data = data.result
  // callname = {
  //   country:data.addressComponent.country
  //   ,province:data.addressComponent.province
  //   ,city:data.addressComponent.city
  //   ,district:data.addressComponent.district
  // }  
  Addr = handleAddr(data.addressComponent)
  Loca = handleLoca(data.location)
  lookUpTable[Loca] = Addr
  // location = data.location
  // location = JSON.stringify(location)
  // window.lookUpTable[location] = callname
}
function handleAddr(addr) {
  if(addr.city == addr.province) {
    return addr.country + addr.province + addr.district + addr.street
  }
  return addr.country + addr.province + addr.city + addr.district + addr.street
}

function handleLoca(loca) {
  loca["lng"] = Math.round(loca["lng"] * 10) / 10;
  loca["lat"] = Math.round(loca["lat"] * 10) / 10;
  return JSON.stringify(loca)
}
function fetchJSONP(url) {
  // 创建 script 标签
  const script = document.createElement('script');
  script.src = `${url}&callback=handleResponse`;
  // console.log(script.src)
  document.head.appendChild(script); // 将 script 标签添加到页面中
  // alert("fuckyou")
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // 最大值和最小值都包含
}


isDragging = false;
// script.js
document.addEventListener('DOMContentLoaded', () => {
  const image = document.getElementById('currentShowing');
  let scale = 1; // 初始缩放比例

  // 监听鼠标滚轮事件
  image.addEventListener('wheel', (event) => {
    event.preventDefault(); // 阻止默认行为

    // 根据滚动方向调整缩放比例
    if (event.deltaY < 0) {
      x = event.offsetX
      y = event.offsetY
      console.log(`x${x}`)
      console.log(`y${y}`)
      image.style.cssText = 'transform-origin:'+x+'px  '+y+'px;'
      // 向上滚动，放大
      scale += 0.1;

    } else {
      // 向下滚动，缩小
      scale -= 0.1;
    }

    // 确保缩放比例不小于1
    if (scale < 1) {
      scale = 1;
    }

    // 应用新的缩放比例
    image.style.transform = `scale(${scale})`;
  });



  image.addEventListener('mousedown', (event) => {
    if(event.button != 0) {
      return
    }
    isDragging = true;
    offsetX = event.clientX;
    offsetY = event.clientY;
  });

  // 鼠标移动时
  document.addEventListener('mousemove', (event) => {

    if (isDragging) {
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
      graphC = document.getElementById("graphContainer")
      graphC.scrollTo({
        left: -x,
        top: -y,
      })
    }
  });

  // 鼠标释放时
  document.addEventListener('mouseup', (event) => {
    if(event.button != 0)
      return
    isDragging = false;
  });
  // 可选：添加点击事件来重置缩放比例
  image.addEventListener('mousedown', (event) => {
    if(event.button != 0) {
      return
    }
    scale = 1;
    image.style.transform = `scale(${scale})`;
  });
});
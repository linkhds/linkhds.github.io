/** 
 * hhWNL v0.1
 * Author : gimldn@gmail.com
 * Date : 2013-11-07
 */
(function(win, undefined) {
	var doc = win.document,
		docElem = doc.documentElement;

	var hhWNL = function() {
		/*
		Calendar
		 */
		var Calendar = function(y, m) {
			var i, time, tmp1, tmp2;

			y = parseInt(y, 10);
			m = parseInt(m, 10);

			this.list = {};
			this.range = this.getCalRange(y, m);

			tmp1 = this.range.startTime;
			for (i = 0; i < 42; i++) {
				time = tmp1 + i * 86400000;
				this.list[time] = {
					solar: new Solar(time),
					lunar: new Lunar(time)
				};
			}

			// 今日
			var nowDate = new Date(),
				nowTime = Date.parse(nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate());
			if (this.list[nowTime]) {
				this.list[nowTime].isToday = true;
			}

			// console.log(this.list);
		};

		Calendar.prototype = {
			// 获取m月的日历的日期范围
			getCalRange: function(y, m) {
				var solarDay = this.getSolarDay(y, m);

				var firstDayofMonth = (new Date(y, m, 1)).getTime();
				var lastDayofMonth = firstDayofMonth + 86400000 * solarDay;

				var preday = (new Date(firstDayofMonth)).getDay() || 7;

				return {
					startTime: firstDayofMonth - preday * 86400000,
					endTime: lastDayofMonth + (42 - solarDay - preday) * 86400000,
					mStartTime: firstDayofMonth,
					mEndTime: lastDayofMonth
				};
			},

			// y年某m+1月的天数
			getSolarDay: function(y, m) {
				return [31, (((y % 4 === 0) && (y % 100 !== 0) || (y % 400 === 0)) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
			},

			addVacation: function() {

			}
		};

		var Solar = function(time) {
			var dateObj = new Date(time);
			this.time = time;
			this.year = dateObj.getFullYear();
			this.month = dateObj.getMonth() + 1;
			this.day = dateObj.getDate();
			this.week = dateObj.getDay();
			this.festival = this.getFestival(this.month, this.day);
			this.term = this.getTerm(this.year, this.month, this.day);
			this.info = '';
		};

		Solar.prototype = {
			terms: ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'],

			termInfo: [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758],

			festivals: {
				'1-1'   : ['元旦'],
				'2-2'   : ['世界湿地日'],
				'2-10'  : ['国际气象节'],
				'2-14'  : ['情人节'],
				'3-3'   : ['全国爱耳日'],
				'3-5'   : ['学雷锋纪念日'],
				'3-8'   : ['妇女节'],
				'3-12'  : ['植树节'],
				'3-14'  : ['国际警察日'],
				'3-15'  : ['消费者权益日'],
				'3-22'  : ['世界水日'],
				'3-23'  : ['世界气象日'],
				'4-1'   : ['愚人节'],
				'4-7'   : ['世界卫生日'],
				'4-22'  : ['世界地球日'],
				'5-1'   : ['劳动节'],
				'5-4'   : ['青年节'],
				'5-8'   : ['世界红十字日'],
				'5-12'  : ['国际护士节'],
				'5-31'  : ['世界无烟日'],
				'6-1'   : ['国际儿童节'],
				'6-5'   : ['世界环境保护日'],
				'7-1'   : ['中共诞辰'],
				'7-2'   : ['国际体育记者日'],
				'7-7'   : ['抗日战争纪念日'],
				'7-11'  : ['世界人口日'],
				'7-30'  : ['非洲妇女日'],
				'8-1'   : ['建军节'],
				'8-15'  : ['抗日战争胜利纪念'],
				'9-9'   : ['毛泽东逝世纪念'],
				'9-10'  : ['中国教师节'],
				'9-18'  : ['九一八事变纪念日'],
				'9-20'  : ['国际爱牙日'],
				'9-27'  : ['世界旅游日'],
				'9-28'  : ['孔子诞辰'],
				'10-1'  : ['国庆节'],
				'10-4'  : ['世界动物日'],
				'10-6'  : ['老人节'],
				'10-10' : ['辛亥革命纪念日'],
				'10-15' : ['国际盲人节'],
				'10-16' : ['世界粮食日'],
				'10-24' : ['联合国日'],
				'11-8'  : ['中国记者日'],
				'11-10' : ['世界青年节'],
				'11-12' : ['孙中山诞辰纪念日'],
				'12-1'  : ['世界艾滋病日'],
				'12-3'  : ['世界残疾人日'],
				'12-10' : ['世界人权日'],
				'12-12' : ['西安事变纪念日'],
				'12-13' : ['南京大屠杀纪念日'],
				'12-20' : ['澳门回归纪念'],
				'12-24' : ['平安夜'],
				'12-25' : ['圣诞节'],
				'12-26' : ['毛泽东诞辰纪念']
			},

			getFestival: function(m, d) {
				return this.festivals[m + '-' + d] || [];
			},

			// 某年的第n个节气为几日(从0小寒起算)
			getSolarTerm: function(y, n) {
				var offDate = new Date((31556925974.7 * (y - 1900) + this.solarTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
				return (offDate.getUTCDate());
			},

			getTerm: function(y, m, d) {
				arguments.callee.cache = arguments.callee.cache || {};

				var cache = arguments.callee.cache,
					t1 = (m - 1) * 2,
					t2 = (m - 1) * 2 + 1;

				if (!cache[y + '-' + m]) {
					cache[y + '-' + m] = {};
					cache[y + '-' + m][(new Date((31556925974.7 * (y - 1900) + this.termInfo[t1] * 60000) + Date.UTC(1900, 0, 6, 2, 5))).getUTCDate()] = this.terms[t1];
					cache[y + '-' + m][(new Date((31556925974.7 * (y - 1900) + this.termInfo[t2] * 60000) + Date.UTC(1900, 0, 6, 2, 5))).getUTCDate()] = this.terms[t2];
				}

				return cache[y + '-' + m][d] || '';
			}
		};

		/*
		Lunar
		 */
		var Lunar = function(time) {
			var i, leap = 0,
				temp = 0;
			var baseDate = new Date(1900, 0, 31);
			var offset = (time - baseDate) / 86400000;

			this.cylDay = offset + 40;
			this.cylMonth = 14;

			for (i = 1900; i < 2100 && offset > 0; i++) {
				temp = this.getYearDays(i);
				offset -= temp;
				this.cylMonth += 12;
			}

			if (offset < 0) {
				offset += temp;
				i--;
				this.cylMonth -= 12;
			}

			this.year = i;
			this.cylYear = i - 1864;

			leap = this.getLeapMonth(i); //闰哪个月
			this.isLeap = false;

			for (i = 1; i < 13 && offset > 0; i++) {
				//闰月
				if (leap > 0 && i == (leap + 1) && !this.isLeap) {
					--i;
					this.isLeap = true;
					temp = this.getLeapDays(this.year);
				} else {
					temp = this.getMonthDays(this.year, i);
				}

				//解除闰月
				if (this.isLeap && i == (leap + 1)) this.isLeap = false;

				offset -= temp;
				if (!this.isLeap) this.cylMonth++;
			}

			if (offset === 0 && leap > 0 && i == leap + 1)
				if (this.isLeap) {
					this.isLeap = false;
				} else {
					this.isLeap = true;
					--i;
					--this.cylMonth;
				}

			if (offset < 0) {
				offset += temp;
				--i;
				--this.cylMonth;
			}

			this.month = i;
			this.day = offset + 1;

			this.GZDay = this.getGanZhi(this.cylDay);
			this.GZMonth = this.getGanZhi(this.cylMonth);
			this.GZYear = this.getGanZhi(this.cylYear);

			this.zodiac = this.getZodiac(this.cylYear);

			this.CNMonth = this.getCNMonth();
			this.CNDay = this.getCNDay(this.month, this.day);

			this.festival = this.getFestival(this.month, this.day);
			this.info = '';
		};

		Lunar.prototype = {
			festivals: {
				'1-1'   : ['春节'],
				'1-15'  : ['元宵节'],
				'5-5'   : ['端午节'],
				'6-24'  : ['火把节'],
				'7-7'   : ['七夕情人节'],
				'7-15'  : ['中元节'],
				'8-15'  : ['中秋节'],
				'9-9'   : ['重阳节'],
				'9-14'   : ['我的生日'],
				'9-18'   : ['老姐生日'],
				'12-8'  : ['腊八节'],
				'12-12'  : ['老婆生日'],
				'12-24' : ['小年'],
				'1-0'   : ['除夕'] // @TODO
			},
			lunarInfo: [
				0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
				0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
				0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
				0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
				0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
				0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
				0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
				0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
				0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
				0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
				0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
				0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
				0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
				0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
				0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
				0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50, 0x06b20,0x1a6c4,0x0aae0,
            	0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
            	0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
            	0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
            	0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
            	0x0d520
			],

			zodiacs: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],

			gan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],

			zhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],

			lunarNum: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],

			lunarNum2: ['初', '十', '廿', '卅', '　'],

			// y年的总天数
			getYearDays: function(y) {
				var i, sum = 348;
				for (i = 0x8000; i > 0x8; i >>= 1) sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
				return (sum + this.getLeapDays(y));
			},

			// y年闰月的天数
			getLeapDays: function(y) {
				if (this.getLeapMonth(y)) return ((this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
				else return (0);
			},

			// y年闰哪个月 1-12 , 没闰传回 0
			getLeapMonth: function(y) {
				return (this.lunarInfo[y - 1900] & 0xf);
			},

			// y年m月的总天数
			getMonthDays: function(y, m) {
				return ((this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
			},

			// 农历月
			getCNMonth: function(m) {
				return (this.isLeap ? '闰' : '') + this.lunarNum[this.month] + '月';
			},

			// 农历日
			getCNDay: function(m, d) {
				var s;

				switch (d) {
					case 10:
						s = '初十';
						break;
					case 20:
						s = '二十';
						break;
					case 30:
						s = '三十';
						break;
					default:
						s = this.lunarNum2[Math.floor(d / 10)];
						s += this.lunarNum[d % 10];
				}
				return s;
			},

			// 干支
			getGanZhi: function(num) {
				return (this.gan[num % 10] + this.zhi[num % 12]);
			},

			// 某年生肖
			getZodiac: function(y) {
				return this.zodiacs[y % 12];
			},

			getFestival: function(m, d) {
				return this.festivals[m + '-' + d] || [];
			}
		};

		/*
		Weather
		 */
		var Weather = function() {};

		Weather.prototype = {

		};

		/*
		View
		 */
		var View = function(container) {
			this.controlWrap = doc.getElementById(container.ctl);
			this.calendarWrap = doc.getElementById(container.cal);
			this.dayWrap = doc.getElementById(container.day);
			this.weatherWrap = doc.getElementById(container.whr);
			this.infoWrap = doc.getElementById(container.inf);
			
			//日历点击事件
			this.calendarWrap.onclick = function(event) {
				var e = e || window.event;
				var target = e.srcElement || e.target;
				if (target.tagName == 'SPAN') {
					target = target.parentNode;
				}
				var day = __INSTANCE__.calendar.list[target.getAttribute('alt')];

				if (day) {
					__INSTANCE__.view.renderDay(day.solar, day.lunar);
					if (target.className.indexOf('wnl-cal__wrap--no') > -1) {
						var year = day.solar.year,
							month = day.solar.month - 1,
							calendar = new Calendar(year, month);

						__INSTANCE__.view.renderControl(year, month);
						__INSTANCE__.view.renderCalendar(calendar);
						__INSTANCE__.calendar = calendar;
					}
				}

				// __INSTANCE__.view.renderInfo('呵呵' + (new Date()).getTime() + '<br>' + '嘻嘻' + (new Date()).getTime());
			};
		};

		View.prototype = {
			getElemsByCls: function(searchClass, node, tag) {
					var i = 0,
						j = 0,
						k = 0,
						classes = [],
						patterns = [],
						elements = null,
						current = null,
						match = null,
						nodes = null,
						result = [];
				if (document.getElementsByClassName) {
					node = node || document;
					tag = tag || "*";
					nodes = node.getElementsByClassName(searchClass);

					for (i = 0;
						(node = nodes[i++]);) {
						if (tag == "*" || node.tagName === tag.toUpperCase()) {
							result.push(node);
						}
					}
					return result.length > 0 ? result : false;
				} else {
					node = node || document;
					tag = tag || "*";
					classes = searchClass.split(" ");
					elements = (tag === "*" && node.all) ? node.all : node.getElementsByTagName(tag);

					i = classes.length;
					while (--i >= 0) {
						patterns.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
					}
					j = elements.length;
					while (--j >= 0) {
						current = elements[j];
						match = false;
						for (k = 0, kl = patterns.length; k < kl; k++) {
							match = patterns[k].test(current.className);
							if (!match) break;
						}
						if (match) result.push(current);
					}
					return result.length > 0 ? result : false;
				}
			},

			modElemClass: function(target, className, remove) {
				var i = 0,
					classNameArr = [];
				var tmpArr = target.className.split(' ');

				for (i = tmpArr.length - 1; i >= 0; i--) {
					if (tmpArr[i] !== '' && tmpArr[i] !== className) {
						classNameArr.push(tmpArr[i]);
					}
				}

				if (!remove) {
					classNameArr.push(className);
				}

				classNameArr.reverse();
				target.className = classNameArr.join(' ');
			},

			renderControl: function(year, month, vacation) {
				var str = '';

				year = parseInt(year, 10);
				month = parseInt(month, 10);

				str = "<div class='head-left clearfix'><span class='left-btn' id='yl_btn'><</span><span id='years' data-years=" + year +">" + year + "</span><span class='right-btn' id='yr_btn'>></span></div>";
				str = str +  "<div class='head-left clearfix'><span class='left-btn' id='ml_btn'><</span><span id='months' data-months=" + month +">" + (month + 1) + "月</span><span class='right-btn' id='mr_btn'>></span></div>";
				// str = '<div class="wnl-ctl__slt"><span>' + year + '年</span><select name="year">';
				// for (i = 1; i < 151; i++) {
				// 	str = str + '<option' + (year === 1900 + i ? ' selected="selected"' : '') + ' value="' + (1900 + i) + '">' + (1900 + i) + '年</option>';
				// }
				// str = str + '</select></div>';

				// str = str + '<div class="wnl-ctl__slt"><span>' + (month + 1) + '月</span><select name="month">';
				// for (i = 1; i < 13; i++) {
				// 	str = str + '<option' + (month === i - 1 ? ' selected="selected"' : '') + ' value="' + (i - 1) + '">' + i + '月</option>';
				// }
				// str = str + '</select></div>';

				// if (vacation) {
				// 	str = str + '<select name="vacation"></select>';
				// }
				// str = str + '<button class="wnl-ctl__btn">今天</button>';

				this.controlWrap.innerHTML = str;

				// 控制器事件绑定
				// this.controlWrap.getElementsByTagName('button')[0].onclick = function(event) {
				// 	var nowDate = new Date(),
				// 		year = nowDate.getFullYear(),
				// 		month = nowDate.getMonth(),
				// 		date = nowDate.getDate(),
				// 		calendar = new Calendar(year, month);

				// 	__INSTANCE__.view.renderControl(year, month);
				// 	__INSTANCE__.view.renderCalendar(calendar);
				// 	__INSTANCE__.calendar = calendar;

				// 	var todayTime = Date.parse(year + '/' + (month + 1) + '/' + date);
				// 	// __INSTANCE__.view.renderDay(calendar.list[todayTime].solar, calendar.list[todayTime].lunar);
				// };
				var change = function(event) {
					// var sltArr = this.parentNode.parentNode.getElementsByTagName('select');
					var sltyear = document.getElementById("years").getAttribute("data-years");
					var sltmonth = document.getElementById("months").getAttribute("data-months");
					var year = sltyear,
						month = sltmonth,
						calendar = new Calendar(year, month);

					__INSTANCE__.view.renderControl(year, month);
					__INSTANCE__.view.renderCalendar(calendar);
					__INSTANCE__.calendar = calendar;
				};
				// this.controlWrap.getElementsByTagName('select')[0].onchange = change;
				// this.controlWrap.getElementsByTagName('select')[1].onchange = change;
				var yl_btn = document.getElementById("yl_btn"),
				yr_btn = document.getElementById("yr_btn"),
				ml_btn = document.getElementById("ml_btn"),
				mr_btn = document.getElementById("mr_btn"),
				years = document.getElementById("years"),
				months = document.getElementById("months");
				yl_btn.onclick = function() {
					var year_num = parseInt(years.getAttribute('data-years'),10);
					if(year_num == 1901) {
						year_num = 1901;
						years.setAttribute("data-years",year_num);
					}else {	
						year_num = year_num - 1;
						years.setAttribute("data-years",year_num);
					}
					change();
				};
				yr_btn.onclick = function() {
					var year_num = parseInt(years.getAttribute('data-years'),10);
					if(year_num == 2100) {
						year_num = 2100;
						years.setAttribute("data-years",year_num);
					}else {	
						year_num = year_num + 1;
						years.setAttribute("data-years",year_num);
					}
					change();
				};
				ml_btn.onclick = function() {
					var year_num = parseInt(years.getAttribute('data-years'),10);
					var month_num = parseInt(months.getAttribute('data-months'),10);
					if(month_num == 0 &&  year_num == 1901 ) {
						month_num = 0;
						months.setAttribute("data-months",month_num);
						year_num = 1901;
						years.setAttribute("data-years",year_num);
					} else if(month_num == 0 &&  year_num >1901 ) {
						month_num = 11;
						months.setAttribute("data-months",month_num);
						year_num = year_num  - 1;
						years.setAttribute("data-years",year_num);
					}else {
						month_num = month_num  - 1;
						months.setAttribute("data-months",month_num);
					}
					change();
					
				};
				mr_btn.onclick = function() {
					var year_num = parseInt(years.getAttribute('data-years'),10);
					var month_num = parseInt(months.getAttribute('data-months'),10);
					

					if(month_num == 11 &&  year_num == 2100 ) {
						month_num = 11;
						months.setAttribute("data-months",month_num);
						year_num = 2100;
						years.setAttribute("data-years",year_num);
					} else if(month_num == 11 &&  year_num < 2100 ) {
						month_num = 0;
						months.setAttribute("data-months",month_num);
						year_num = year_num  + 1;
						years.setAttribute("data-years",year_num);
					}else {
						month_num = month_num  + 1;
						months.setAttribute("data-months",month_num);
					}
					change();
					
				};
			},

			renderCalendar: function(calObj) {
				var i = 0,
					time = 0,
					day = null,
					list = calObj.list,
					startTime = calObj.range.startTime,
					// selectedTime = parseInt(this.dayWrap.getAttribute('alt'), 10),
					tmpStr = '',
					// str = '<table><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>';
					str = "<div class='weeks'><ul class='clearfix'><li class='act'>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li class='act'>六</li></ul></div>";
				
				// str = str + '<tbody><tr>';
				str = str + "<div class='days'><ul class='clearfix' id='day_li'>"
				for (i = 0; i < 42; i++) {
					time = startTime + i * 86400000;
					day = list[time];
					if (day) {
						// 设定当前日期的class
						tmpStr = 'wnl-cal__wrap';

						// 当前月以外的日期
						if (time < calObj.range.mStartTime || time >= calObj.range.mEndTime) {
							tmpStr = 'wnl-cal__solar';
						}
						// 周末 今天 or 节日 or 假期
						if (day.isToday) {
							tmpStr = tmpStr + ' wnl-cal__wrap-today';
						}
						else  if (day.solar.week === 0||day.solar.week === 6) {
							tmpStr = tmpStr + ' wnl-cal__wrap-weekend';
						}  
						//else if (day.solar.festival.length > 0 || day.lunar.festival.length > 0) {
						// 	tmpStr = tmpStr + ' wnl-cal__wrap--festival';
						// } else if (day.solar.vacation) {
						// 	tmpStr = tmpStr + ' wnl-cal__wrap--vacation';
						// }
						// 当前选中的
						// if (selectedTime === time) {
						// 	tmpStr = tmpStr + ' wnl-cal__wrap--seleted';
						// }

						// td开始
						// str = str + '<td><div class="' + tmpStr + '" alt="' + time + '">';
						str = str + '<li class="' + tmpStr + '" alt="' + time + '">' 
						// 今天标签
						// if (day.isToday) {
							// str = str + '<div class="wnl-cal__lab"><i></i><b>今</b></div>';
						// }
						// 假期的标签
						// if (day.solar.vacation) {
						// 	str = str + '<div class="wnl-cal__lab"><i></i><b>假</b></div>';
						// }

						// 阳历
						// str = str + '<div class="wnl-cal__solar">' + day.solar.day + '</div>';
						str = str + day.solar.day;
						// 如有节气,则不显示阴历

						if (day.lunar.festival.length > 0) {
							// str = str + '<div class="wnl-cal__festival">' + day.lunar.festival.join(' ') + '</div>';
							str = str + '<span>' + day.lunar.festival.join(' ') + '</span>';
						} else if (day.solar.festival.length > 0) {
							// str = str + '<div class="wnl-cal__festival">' + day.solar.festival.join(' ') + '</div>';
							str = str + '<span>' + day.solar.festival.join(' ') + '</span>';
						} else if (day.solar.term) {
							// str = str + '<div class="wnl-cal__term">' + (day.solar.term ? day.solar.term : '') + '</div>';
							str = str + '<span>' + (day.solar.term ? day.solar.term : '') + '</span>';
						} else {
							// str = str + '<div class="wnl-cal__lunar">' + day.lunar.CNDay + '</div>';
							str = str + '<span>' + day.lunar.CNDay + '</span>';
						}

						// td结束
						// str = str + '</div></td>';
						str = str + "</li>";

						// 换行
						// if (i % 7 === 6) {
						// 	str = str + '</tr><tr>';
						// }
					}
				}
				// str = str + '</tbody></table>';
				str = str + '</ul></div>';

				this.calendarWrap.innerHTML = str;
			},

			renderDay: function(solar, lunar) {
				var str = [
					'<div class="wnl-l"><div class="wnl-day__solar">' + solar.year + '-' + solar.month + '<div class="wnl-day__day">' + solar.day + '</div>' + '星期' + ['日', '一', '二', '三', '四', '五', '六'][solar.week] + '</div></div>' ,
					
					'<div class="wnl-r"><div class="wnl-day__lunar">农历：' + lunar.CNMonth /*+ (lunar.getMonthDays(lunar.year, lunar.month) == 29 ? '小' : '大')*/ + lunar.CNDay + '</div>',
					'<div class="wnl-day__GZ"><span>' + lunar.GZYear + '年</span>'+ '【' + lunar.zodiac + '年】</div>',
					'<div class="wnl-day__GZ"><span>' + lunar.GZMonth + '月</span><span>' + lunar.GZDay + '日</span></div>',
					'<div class="wnl-day__term">' + solar.term + '</div>',
					'<div class="wnl-day__festival">' + solar.festival.join(' ') + ' ' + lunar.festival.join(' ') + '</div></div>',
				].join('');
				this.dayWrap.innerHTML = str;
				this.dayWrap.setAttribute('alt', solar.time);

				var div = this.getElemsByCls('wnl-cal__wrap--seleted', this.calendarWrap);
				if (div.length > 0) {
					this.modElemClass(div[0], 'wnl-cal__wrap--seleted', true);
				}

				div = this.getElemsByCls('wnl-cal__wrap', this.calendarWrap);
				for (var i = div.length - 1; i >= 0; i--) {
					if (parseInt(div[i].getAttribute('alt'), 10) === solar.time) {
						this.modElemClass(div[i], 'wnl-cal__wrap--seleted');
					}
				}
			},

			// renderWeather: function(city) {
			// 	var str = '<div class="wnl-whr__add">你可能在 <a href="#">广州 [切换]</a></div>';

			// 	str = str + '<div class="wnl-whr__info"><img src="#" alt="#" /><a href="#">34℃~26℃<br>微风:小于3级小于3级</a></div>';

			// 	this.weatherWrap.innerHTML = str;
			// },

			// renderInfo: function(msg) {
			// 	var str = '<span class="wnl-inf__ico"></span>';

			// 	this.infoWrap.innerHTML = str + msg;
			// }
		};

		var __INSTANCE__ =  {
			init: function(setting) {
				var nowDate = new Date(),
					year = nowDate.getFullYear(),
					month = nowDate.getMonth(),
					date = nowDate.getDate(),
					calendar = new Calendar(year, month),
					view = new View(setting.container);

				view.renderControl(year, month);

				view.renderCalendar(calendar);

				var todayTime = Date.parse(year + '/' + (month + 1) + '/' + date);
				view.renderDay(calendar.list[todayTime].solar, calendar.list[todayTime].lunar);

				// view.renderWeather(setting.city);

				this.calendar = calendar;
				this.setting = setting;
				this.view = view;

				delete this.init;

				return this;
			}
		};

		return __INSTANCE__;
	};

	win.hhWNL = hhWNL();

})(window, undefined);
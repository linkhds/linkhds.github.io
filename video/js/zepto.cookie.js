// Zepto.cookie plugin
// 
// Copyright (c) 2010, 2012 
// @author Klaus Hartl (stilbuero.de)
// @author Daniel Lacy (daniellacy.com)
// 
// Dual licensed under the MIT and GPL licenses:
// http://www.opensource.org/licenses/mit-license.php
// http://www.gnu.org/licenses/gpl.html
//使用方式
//存数据： 
//$.fn.cookie('foo','bar'); 
// 取数据： 
// $.fn.cookie('foo');
;(function($){
    $.extend($, {
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();  
            d.setTime(d.getTime() + (exdays*24*60*60*1000));  
            var expires = "expires="+d.toUTCString();  
            document.cookie = cname + "=" + cvalue + "; " + expires;  
        },
        getCookie: function(cname) {
             var name = cname + "=";  
            var ca = document.cookie.split(';');  
            for(var i=0; i<ca.length; i++) {  
                var c = ca[i];  
                while (c.charAt(0)==' ') c = c.substring(1);  
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);  
            }  
            return "";  
        },
        delCookie: function(name) {
            $.setCookie(name, "", -1); 
        }

    })
})(Zepto)
define(function (require, exports, module) {
	var React = require('react')
	var $ = require('jquery')

	var Item = React.createClass({displayName: "Item",
		render: function() {
			return (
				React.createElement("div", {calssName: "waterfall-item"}, 
					React.createElement("img", {src: this.props.url}), 
					React.createElement("p", null, this.props.describe)
				)
				)
		}
	})

	var List = React.createClass({displayName: "List",
		render: function() {
			return (
				React.createElement("div", {className: "waterfall-list", style:  {width: this.props.width} }, 
				
					this.props.items.map(function(item) {
						return React.createElement(Item, React.__spread({},  item))
					})
				
				)
				)
		}
	})

	var Waterfall = React.createClass({displayName: "Waterfall",
		getInitialState: function() {
			return {
				width: 0
			}
		},

		componentDidMount: function() {
			var $parent = $(this.refs.waterfall.getDOMNode())
			var width = $parent.width()
			var dw = width / this.props.itemLength
			this.setState({
				width: dw
			})
		},
		assign: function() {
			var itemList = []
			var itemLength = this.props.itemLength
			var dataList = this.props.dataList
			for (var i = 0; i < itemLength; i += 1) {
				var item = itemList[itemLength % i] = itemList[itemLength % i] || []
				item.push(dataList[i])
			}
			return itemList
		},
		render: function() {
			return (
				React.createElement("div", {class: "waterfall", ref: "waterfall"}, 
					
						this.assign().map(function(items) {
							return React.createElement(List, {width: this.state.width, items: items})
						})
					
				)
				)
		}
	})


	var waterfall = {
		getData: function() {
			$.ajax({
				url: 'http://photo.weibo.com/page/waterfall',
				type: 'get',
				dataType: 'jsonp',
				data: {
					ajwvr: 6,
					filter: 'wbphoto|||v6',
					page: 4,
					count: 20,
					module_id: 'profile_photo',
					oid: '1005051627825392',
					lastMid: '3829394939123704',
					lang: 'zh-cn',
					_t: 1
				},
				success: function(response) {
					$('body').html(response.data.html.join('/n'))
				}
			})
		},


		urls: ['img/01.jpg','img/02.jpg','img/03.jpg','img/04.jpg','img/05.jpg','img/06.jpg'],
		preload: function(urls, callback) {
			var count = 0
			var total = urls.length
			var div = document.createElement('div')
			div.style.display = 'none'
			document.body.appendChild(div)
			urls.forEach(function(url) {
				var img = new Image()
				img.onload = function() {
					count += 1
					if (count === total) {
						document.body.removeChild(div)
						callback()
					}
				}
				img.src = url
				div.appendChild(img)
			})
		},
		dataList: [],
		nearBottom: function() {
			this.preload(this.urls, function() {
				this.urlList = this.urlList.concat(this.urls.sort(function() {
					return Math.random() - 0.5
				}))
			}.bind(this))
		},

		onScroll: function() {
			window.addEventListener('scroll', function() {
				setTimeout(function() {
					var $win = $(window)
					var scrollTop = $win.scrollTop()
					var winHeight = $win.height()
					var docHeight = $(document).height()
					var diff = scrollTop + winHeight - docHeight
					if (Math.abs(diff) <= 50) {
						this.nearBottom()
					}
				}.bind(this), 0)
			}.bind(this), false)
			return this
		},
		init: function() {
			this.getData()
		}
	}

	module.exports = waterfall
})
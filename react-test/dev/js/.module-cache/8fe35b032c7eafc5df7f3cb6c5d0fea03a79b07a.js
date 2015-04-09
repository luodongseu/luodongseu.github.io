define(function (require, exports, module) {
	var React = require('react')
	var $ = require('jquery')

	var Item = React.createClass({displayName: "Item",
		render: function() {
			return (
				React.createElement("div", {calssName: "waterfall-item"}, 
					
						this.props.pics.map(function(pic) {
							return React.createElement("img", {src: pic})
						}), 
					
					React.createElement("p", null, this.props.content)
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
		page: 2,
		onAjax: false,
		$loading: $('<div>加载中……</div>'),
		$end: $('<div>加载完毕</di>'),
		getData: function() {
			if (this.onAjax) {
				return
			}
			$('#container').append(this.$loading)
			this.onAjax = true
			$.ajax({
				url: 'http://photo.weibo.com/page/waterfall',
				type: 'get',
				dataType: 'jsonp',
				data: {
					ajwvr: 6,
					filter: 'wbphoto|||v6',
					page: this.page++,
					count: 20,
					module_id: 'profile_photo',
					oid: '1005052141100877',
					lang: 'zh-cn',
					_t: 1
				},
				success: function(response) {
					this.$loading.remove()
					var data = response.data
					if (+data.page === +data.pagesize) {
						$('#container').append(this.$end)
						$(window).off('scroll')
					}
					this.onAjax = false
					this.render(data.html.join(''))
				}.bind(this)
			})
		},

		convertData: function(html) {
			var $html = $('<div/>').html(html)
			var dataList = []
			$html.find('.WB_cardwrap').each(function() {
				var $this = $(this)
				var pics = []
				$this.find('.photoArea img.photo_pic').each(function() {
					pics.push(this.src)
				})
				dataList.push({
					pics: pics,
					content: $this.find('.box_plus .describe span').attr('title')
				})
			})
			return dataList
		},

		render: function(html) {
			var dataList = this.convertData(html)
			this.dataList = this.dataList.concat(dataList)
			debugger
			React.render(
				React.createElement(Waterfall, {itemLength: 2, dataList: this.dataList}),
				document.getElementById('#container')
				)
		},

		dataList: [],
		nearBottom: function() {
			this.getData()
			return this
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
			this.nearBottom().onScroll()
		}
	}

	module.exports = waterfall
})
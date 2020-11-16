;(function () {
    function doElms(elms) {
        if (elms instanceof Object) {
            return [elms];
        } else if (elms instanceof Array) {
            return elms;
        }
        let tempElms = [];
        // 否则是字符串
		// 这部分可以修改为不使用jquery
        $(elms).each(function () {
            tempElms.push($(this));
        })
        return tempElms;
    }

    const defaultOpts = {
        maskBackground: '#fff',

		// 骨架屏动画
		skeletonAnimation: true,
		// 骨架片背景
		skeletonBackground: 'linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%)'
    };

    window.Skeleton = Skeleton;

    function Skeleton(elms, opts = {}) {
        this.parentElm = document.body;

        let newElms = [];
        for (let elm of elms) {
            newElms = newElms.concat(doElms(elm));
        }
        this.elms = newElms;
        this.opts = Object.assign(defaultOpts, opts);
    }

    Skeleton.prototype = {
        initStyle() {
            var style = `
.skeleton-mask-container-item{
	background: ${this.opts.skeletonBackground};
	background-size: 400% 100%;
}
.skeleton-mask-container-item.animation{
	-webkit-animation: ant-skeleton-loading 1.4s ease infinite;
	animation: skeleton-mask-container-item-loading 1.4s ease infinite;
}
@-webkit-keyframes skeleton-mask-container-item-loading{0%{background-position:100% 50%}to{background-position:0 50%}}
@keyframes skeleton-mask-container-item-loading{0%{background-position:100% 50%}to{background-position:0 50%}}
            `;
            var ele = document.createElement("style");
            ele.innerHTML = style;
            document.getElementsByTagName('head')[0].appendChild(ele)
        },
        // 渲染
        render: function () {
            this.initStyle();
            // 在顶级对象下创建悬浮遮挡层
            this.mask = this.createMask();
            this.parentElm.appendChild(this.mask);

            return this.refresh();
        },

        // 刷新包括高宽
        refresh: async function () {

            this.mask.style.width = this.parentElm.scrollWidth + 'px';
            this.mask.style.height = this.parentElm.scrollHeight + 'px';

            this.maskContainer && this.maskContainer.remove();
            this.maskContainer = this.createMaskContainer();

            this.mask.appendChild(this.maskContainer);

            // 在骨架对象上创建骨架层
            for (let elm of this.elms) {
                await this.createSkeleton(this.maskContainer, elm);
            }

			this.mask.style.visibility = 'visible';
        },

        // 显示遮挡层
        show: function () {
			this.mask.style.display = 'block'
        },
        // 隐藏遮挡层
        hide: function () {
			this.mask.style.display = 'none';
        },
        // 销毁后需要重新渲染才行
        destroy: function () {
            this.mask && this.mask.remove();
			this.parentElm.style.visibility = 'visible';
        },

        createMask: function () {
            var div = document.createElement('div');
            div.className = "skeleton-mask";
            div.style.position = 'absolute';
            div.style.top = 0;
            div.style.left = 0;
            div.style.background = this.opts.maskBackground;
            return div;
        },
        createMaskContainer: function () {
            var div = document.createElement('div');
            div.className = "skeleton-mask-container";
            div.style.position = 'relative';
            div.style.width = '100%';
            div.style.height = '100%';
            return div;
        },
        createSkeleton: function (container, elm) {
            var div = document.createElement('div');
            div.className = "skeleton-mask-container-item " + (this.opts.skeletonAnimation ? 'animation' : '');
            div.style.position = 'absolute';


            var load = () => {
                let offset = this.elmOffset(elm);
                div.style.top = offset.top;
                div.style.left = offset.left;
                // copy他的 raduis
                div.style.width = (elm.offsetWidth - 4) + 'px';
                div.style.height = (elm.offsetHeight - 4) + 'px';
                div.style.margin = '2px';
                div.style.borderRadius = elm.style.borderRadius;

                container.appendChild(div);
            }

            return new Promise((resolve)=>{
				if (elm.complete === false) {
					elm.onload = function () {
						load();
						resolve();
					}
				} else {
					load()
					resolve();
				}
			})

        },

        // 计算元素到顶级元素的top,left
        elmOffset: function (curEle) {
            var totalLeft = null, totalTop = null, par = curEle.offsetParent;
            //首先加自己本身的左偏移和上偏移
            totalLeft += curEle.offsetLeft;
            totalTop += curEle.offsetTop
            //只要没有找到body，我们就把父级参照物的边框和偏移也进行累加
            while (par) {
                if (navigator.userAgent.indexOf("MSIE 8.0") === -1) {
                    //累加父级参照物的边框
                    totalLeft += par.clientLeft;
                    totalTop += par.clientTop
                }

                //累加父级参照物本身的偏移
                totalLeft += par.offsetLeft;
                totalTop += par.offsetTop
                par = par.offsetParent;
            }

            return {
                left: totalLeft,
                top: totalTop
            }
        }
    }
})(window);

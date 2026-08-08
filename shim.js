(function () {
  "use strict";
  /* wedclone shim: run the site fully offline. Any API/network call the original
     app makes is answered locally (or safely dropped). Nothing is ever sent to the
     original server, and the site's CSP blocks anything this shim might miss. */
  var HOSTS = ["api.tinybird.co", "njsfaofgbfungbhgzdnd.supabase.co", "www.google.com"];
  var PATHS = [".well-known/jwks.json"];

  function isApi(url) {
    if (!url) return false;
    if (PATHS.some(function (p) { return url.indexOf(p) !== -1; })) return true;
    try { var u = new URL(url, location.href); return HOSTS.indexOf(u.hostname) !== -1; }
    catch (e) { return false; }
  }
  function mockBody() { return JSON.stringify({ data: { success: true }, error: null }); }
  function delayed(fn) { setTimeout(fn, 300); }

  /* ---- fetch ---- */
  var realFetch = window.fetch;
  if (realFetch && !realFetch.__wcdShimmed) {
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      if (isApi(url)) {
        return new Promise(function (resolve) {
          delayed(function () {
            resolve(new Response(mockBody(), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }));
          });
        });
      }
      return realFetch.apply(this, arguments);
    };
    window.fetch.__wcdShimmed = true;
  }

  /* ---- XMLHttpRequest ---- */
  var RealXHR = window.XMLHttpRequest;
  if (RealXHR && !RealXHR.__wcdShimmed) {
    function WcdXHR() {
      this._url = "";
      this._method = "GET";
      this._headers = {};
      this._aborted = false;
      this.readyState = 0;
      this.status = 0;
      this.statusText = "";
      this.response = "";
      this.responseText = "";
      this.responseType = "";
      this.timeout = 0;
      this.withCredentials = false;
      this.onreadystatechange = null;
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      this.onloadend = null;
      this.ontimeout = null;
      this._real = null;
    }
    WcdXHR.prototype.open = function (method, url, async, user, pass) {
      this._method = method; this._url = url || "";
    };
    WcdXHR.prototype.setRequestHeader = function (k, v) { this._headers[k] = v; };
    WcdXHR.prototype.getResponseHeader = function () { return null; };
    WcdXHR.prototype.getAllResponseHeaders = function () { return ""; };
    WcdXHR.prototype.overrideMimeType = function () {};
    WcdXHR.prototype.abort = function () {
      this._aborted = true;
      this.readyState = 4;
      if (this.onabort) this.onabort.call(this);
      if (this.onloadend) this.onloadend.call(this);
    };
    WcdXHR.prototype.send = function (body) {
      var self = this;
      if (!isApi(this._url)) {
        /* not an API call: hand off to a real XHR (CSP blocks external ones) */
        try {
          var real = new RealXHR();
          this._real = real;
          real.open(this._method, this._url, true);
          for (var k in this._headers) {
            try { real.setRequestHeader(k, this._headers[k]); } catch (e) {}
          }
          real.onreadystatechange = function () {
            self.readyState = real.readyState;
            self.status = real.status;
            self.statusText = real.statusText;
            self.response = real.response;
            self.responseText = real.responseText;
            if (self.onreadystatechange) self.onreadystatechange.call(self);
          };
          real.onload = function () { if (self.onload) self.onload.call(self); };
          real.onerror = function () { if (self.onerror) self.onerror.call(self); };
          real.onabort = function () { if (self.onabort) self.onabort.call(self); };
          real.ontimeout = function () { if (self.ontimeout) self.ontimeout.call(self); };
          real.onloadend = function () { if (self.onloadend) self.onloadend.call(self); };
          real.send(body);
        } catch (e) {
          this.readyState = 4;
          if (this.onerror) this.onerror.call(this);
          if (this.onloadend) this.onloadend.call(this);
        }
        return;
      }
      this.readyState = 1;
      if (this.onreadystatechange) this.onreadystatechange.call(this);
      delayed(function () {
        if (self._aborted) return;
        self.status = 200;
        self.statusText = "OK";
        self.response = self.responseText = mockBody();
        self.readyState = 4;
        if (self.onreadystatechange) self.onreadystatechange.call(self);
        if (self.onload) self.onload.call(self);
        if (self.onloadend) self.onloadend.call(self);
      });
    };
    window.XMLHttpRequest = WcdXHR;
    window.XMLHttpRequest.__wcdShimmed = true;
  }

  /* ---- navigator.sendBeacon ---- */
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon = function () { return true; };
  }

  /* ---- WebSocket ---- */
  if (window.WebSocket) {
    window.WebSocket = function (url, protocols) {
      var self = this;
      this.url = url;
      this.protocol = "";
      this.readyState = 0;
      this.bufferedAmount = 0;
      this.onopen = null; this.onmessage = null; this.onerror = null; this.onclose = null;
      setTimeout(function () {
        if (self.readyState !== 0) return;
        self.readyState = 3;
        if (self.onerror) { try { self.onerror(new Event("error")); } catch (e) {} }
        if (self.onclose) {
          try { self.onclose(new CloseEvent("close", { wasClean: false, code: 1006 })); } catch (e) {}
        }
      }, 60);
    };
    window.WebSocket.prototype.send = function () {};
    window.WebSocket.prototype.close = function () {};
    window.WebSocket.CONNECTING = 0; window.WebSocket.OPEN = 1;
    window.WebSocket.CLOSING = 2; window.WebSocket.CLOSED = 3;
  }

  /* ---- EventSource ---- */
  if (window.EventSource) {
    window.EventSource = function (url, options) {
      var self = this;
      this.url = url;
      this.withCredentials = false;
      this.readyState = 0;
      this.CONNECTING = 0; this.OPEN = 1; this.CLOSED = 2;
      this.onopen = null; this.onmessage = null; this.onerror = null;
      setTimeout(function () {
        if (self.readyState !== 0) return;
        self.readyState = 2;
        if (self.onerror) { try { self.onerror(new Event("error")); } catch (e) {} }
      }, 60);
    };
    window.EventSource.prototype.close = function () {};
    window.EventSource.CONNECTING = 0; window.EventSource.OPEN = 1; window.EventSource.CLOSED = 2;
  }
})();

/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/* Pessimistic call graph builder. */
    var graph = require('./graph'),
        natives = require('./natives'),
        flowgraph = require('./flowgraph'),
        callgraph = require('./callgraph');

    function addOneShotEdges(ast, fg) {
        // set up flow for one-shot calls
        ast.attr.functions.forEach(function (fn) {
            var parent = fn.attr.parent,
                childProp = fn.attr.childProp;

            if (childProp === 'callee' && parent &&
                (parent.type === 'CallExpression' || parent.type === 'NewExpression')) {
                // one-shot closure
                parent.attr.oneshot = true;
                for (var i = 0, nargs = parent.arguments.length; i < nargs; ++i) {
                    if (i >= fn.params.length)
                        break;
                    fg.addEdge(flowgraph.argVertex(parent, i + 1), flowgraph.parmVertex(fn, i + 1));
                }
                fg.addEdge(flowgraph.retVertex(fn), flowgraph.resVertex(parent));
            } else {
                // not a one-shot closure
                for (var i = 0, nparms = fn.params.length; i <= nparms; ++i)
                    fg.addEdge(flowgraph.unknownVertex(), flowgraph.parmVertex(fn, i));
                fg.addEdge(flowgraph.retVertex(fn), flowgraph.unknownVertex());
            }
        });

        // set up flow for all other calls
        ast.attr.calls.forEach(function (call) {
            if (!call.attr.oneshot)
                for (var i = 0, nargs = call.arguments.length; i <= nargs; ++i)
                    fg.addEdge(flowgraph.argVertex(call, i), flowgraph.unknownVertex());
            fg.addEdge(flowgraph.unknownVertex(), flowgraph.resVertex(call));
        });
    }

    function buildCallGraph(ast, noOneShot) {
        var fg = new graph.FlowGraph();
        natives.addNativeFlowEdges(fg);
        if (!noOneShot)
            addOneShotEdges(ast, fg);
        flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
        return callgraph.extractCG(ast, fg);
    }

    exports.buildCallGraph = buildCallGraph;

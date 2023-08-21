import moment from 'moment';
import Order from '../order/order.schema';
import Request from '../RequestItems/requestItem.schema';

export const getGraphdata = () => async (req, res) => {
  try {
    const { filter } = req.query;

    if (!filter || (filter !== 'month' && filter !== 'week')) {
      return res.status(400).send('Invalid filter value. Use "week" or  "month" .');
    }
    if ( filter === 'month') {
      const data = await monthlyData(moment().startOf('year'), moment());
      res.status(200).send(data);
    }
    else if (filter === 'week') {
      const data = await weeklyData(moment().startOf('week'), moment().endOf('week'));
      res.status(200).send(data);
    }




  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};

const monthlyData = async (startDate, endDate) => {
  const ordersData = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startDate.toDate(), $lt: endDate.toDate() } },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        order: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
  ]);

  const requestData = await Request.aggregate([
    {
      $match: { createdAt: { $gte: startDate.toDate(), $lt: endDate.toDate() } },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        request: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
  ]);
  const data = ordersData.map((orderData, index) => ({
    month: orderData._id.month,
    order: orderData.order,
    request: requestData[index].request,
  }));
  return data;

};

const weeklyData = async (startOfWeek, endOfWeek) => {
  const pipeline = [
    {
      $match: { createdAt: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() } },
    },
    {
      $group: {
        _id: { day: { $dayOfMonth: '$createdAt' } },
        order: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        day: '$_id.day',
        order: 1,
      },
    },
    {
      $sort: { day: 1 },
    },
  ];

  const ordersData = await Order.aggregate(pipeline);
  const requestData = await Request.aggregate(pipeline);

  // Merge the ordersData and requestData arrays to create the final data array
  const data = ordersData.map((orderData, index) => ({
    day: orderData?.day,
    order: orderData?.order || 0,
    request: requestData[index]?.order || 0,
  }));

  return(data);

};

export const getHeatmap = () => async (req, res) => {
  try {
    const heatmapData = [];

    for (let day = 1; day <= 7; day++) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      startOfDay.setDate(startOfDay.getDate() - startOfDay.getDay() + day);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const ordersData = await Order.aggregate([
        {
          $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        },
        {
          $group: {
            _id: { hour: { $hour: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            hour: '$_id.hour',
            count: 1,
          },
        },
      ]);

      const dayData = {
        day,
        '3am': 0,
        '6am': 0,
        '9am': 0,
        '12am': 0,
        '3pm': 0,
        '6pm': 0,
        '9pm': 0,
        '12pm': 0,
      };

      ordersData.forEach((data) => {

        const hour = (data.hour)+6;

        const slot = hour >= 3 && hour < 6 ? '3am' : hour >= 6 && hour < 9 ? '6am' :
          hour >= 9 && hour < 12 ? '9am' : hour >= 12 && hour < 15 ? '12am' :
            hour >= 15 && hour < 18 ? '3pm' : hour >= 18 && hour < 21 ? '6pm' : '9pm';
        dayData[slot] += data.count;
      });

      heatmapData.push(dayData);
    }

    res.status(200).send(heatmapData);

  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};

export const overviewData = ({ db }) => async (req, res) => {
  try {
    const order = await db.aggr({
      table: Order, key: [{
        $group: {
          _id: null,
          totalCost: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$estimatedTotal', 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          canceled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
          totalOrder: { $sum: 1 }
        }
      }]
    });
    const totalReq = await db.aggr({ table: Request, key: [{ $group: { _id: null, totalReq: { $sum: 1 } } }] });
    res.send({ ...order[0], totalReq: totalReq[0].totalReq });


  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};


export const dashBoardData = ({ db }) => async (req, res) => {

  try {
    const data = {};
    const { filter } = req.query;

    if (!filter || (filter !== 'month' && filter !== 'week')) {
      return res.status(400).send('Invalid filter value. Use "week" or  "month" .');
    }
    if (filter === 'month') {
      const chartData = await monthlyData(moment().startOf('year'), moment());
      data.chart = chartData;
    }
    else if (filter === 'week') {
      const chartData = await weeklyData(moment().startOf('week'), moment().endOf('week'));
      data.chart = chartData;
    }
    data.heatmap = await getHitmapData();
    const order = await db.aggr({
      table: Order, key: [{
        $group: {
          _id: null,
          totalCost: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$estimatedTotal', 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          canceled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } },
          totalOrder: { $sum: 1 }
        }
      }]
    });
    const totalReq = await db.aggr({ table: Request, key: [{ $group: { _id: null, totalReq: { $sum: 1 } } }] });
    data.overview = { ...order[0], totalReq: totalReq[0].totalReq };

    res.status(200).send(data);


  } catch (error) {
    console.log(error);
    res.status(500).send('Something wents wrong');

  }
};



const getHitmapData = async () => {
  const heatmapData = [];

  for (let day = 1; day <= 7; day++) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setDate(startOfDay.getDate() - startOfDay.getDay() + day);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const ordersData = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      },
      {
        $group: {
          _id: { hour: { $hour: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          count: 1,
        },
      },
    ]);

    const dayData = {
      day,
      '3am': 0,
      '6am': 0,
      '9am': 0,
      '12am': 0,
      '3pm': 0,
      '6pm': 0,
      '9pm': 0,
      '12pm': 0,
    };

    ordersData.forEach((data) => {

      const hour = (data.hour) + 6;

      const slot = hour >= 3 && hour < 6 ? '3am' : hour >= 6 && hour < 9 ? '6am' :
        hour >= 9 && hour < 12 ? '9am' : hour >= 12 && hour < 15 ? '12am' :
          hour >= 15 && hour < 18 ? '3pm' : hour >= 18 && hour < 21 ? '6pm' : '9pm';
      dayData[slot] += data.count;
    });

    heatmapData.push(dayData);
  }
  return heatmapData;
};
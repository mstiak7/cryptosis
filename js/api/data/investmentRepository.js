const {contructCreateMatchString, contructUpdateMatchString, createMatchObj} = require('./utils');
const {runQuery} = require('./query');

let DbDriver;

const init = driver => {
  DbDriver = driver;
}

const saveInvestment = async (investment, user) => {
  return await runQuery(
    DbDriver,
    `
      MATCH (b:Broker), (t:InvestmentType), (u:User)
      WHERE b.name="${investment.broker}" AND t.name="${investment.investmentType}" AND ID(u)=${Number(user.id)}
      CREATE (b)<-[:HAS_BROKER]-(i:Investment ${contructCreateMatchString(investment)})-[:HAS_TYPE]->(t)
      CREATE (u)-[:HAS_INVESTMENT]->(i)
      RETURN i{ .*, id: ID(i) }
    `,
    createMatchObj(investment)
  );
}

const updateInvestment = async investment => {
  return await runQuery(
    DbDriver,
    `
      MATCH (i:Investment), (b:Broker), (t:InvestmentType)
      WHERE ID(i) = ${investment.id} AND b.name="${investment.broker}" AND t.name="${investment.investmentType}"
      SET i = ${contructCreateMatchString(investment)}
      WITH i, b, t
      MATCH (b2:Broker)<-[hb:HAS_BROKER]-(i)-[ht:HAS_TYPE]->(t2:InvestmentType)
      DELETE hb, ht
      WITH i, b, t
      CREATE (b)<-[:HAS_BROKER]-(i)-[:HAS_TYPE]->(t)
      RETURN i{ .*, id: ID(i) }
    `,
    createMatchObj(investment)
  );
}

const deleteInvestment = async investmentId => {
  return  await runQuery(
    DbDriver,
    `
      MATCH (i:Investment)
      WHERE ID(i) = ${investmentId}
      DETACH DELETE i
    `
  )
}


const saveInvestmentType = async investmentType => {
  return await runQuery(
    DbDriver,
    `
      CREATE (t:InvestmentType ${contructCreateMatchString(investmentType)})
      RETURN t{ .*, id: ID(t) }
    `,
    createMatchObj(investmentType)
  );
}

const updateInvestmentType= async investmentType => {
  return  await runQuery(
    DbDriver,
    `
      MATCH (t:InvestmentType)
      WHERE ID(t) = ${investmentType.id}
      SET t = ${contructCreateMatchString(investmentType)}
      RETURN t{ .*, id: ID(t) }
    `,
    createMatchObj(investmentType)
  )
}

const deleteInvestmentType= async investmentTypeId => {
  return  await runQuery(
    DbDriver,
    `
      MATCH (t:InvestmentType)
      WHERE ID(t) = ${investmentTypeId}
      DETACH DELETE t
    `
  )
}

module.exports = {
  init,
  saveInvestment,
  updateInvestment,
  deleteInvestment,
  saveInvestmentType,
  updateInvestmentType,
  deleteInvestmentType
};

